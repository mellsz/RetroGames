using System.Transactions;
using RetroGames.Model.Constantes;
using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class PedidoService(IRepositorySet repositorios, IUsuarioAtualService usuario) : IPedidoService
{
    public async Task<PedidoDetalhe> CriarAsync(IReadOnlyCollection<ItemCompra> itens)
    {
        if (itens is null || itens.Count == 0 ||
            itens.Any(item => item.IdJogo <= 0 || item.Quantidade is < 1 or > 10) ||
            itens.Select(item => item.IdJogo).Distinct().Count() != itens.Count)
            throw new BusinessRuleException(BusinessErrors.PEDIDO_INVALIDO);

        var idUsuario = usuario.IdUsuario ?? throw new BusinessRuleException(BusinessErrors.USUARIO_NAO_AUTENTICADO);
        // A ordem estável diminui a chance de deadlock em compras simultâneas.
        var itensOrdenados = itens.OrderBy(item => item.IdJogo).ToArray();
        using var transacao = new TransactionScope(
            TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted, Timeout = TimeSpan.FromSeconds(30) },
            TransactionScopeAsyncFlowOption.Enabled);
        var jogos = new List<(Jogo Jogo, int Quantidade)>();
        foreach (var item in itensOrdenados)
        {
            var jogo = await repositorios.Jogo.BuscarPorIdAsync(item.IdJogo);
            if (jogo is null || !jogo.Ativo)
                throw new BusinessRuleException(BusinessErrors.JOGO_INDISPONIVEL);
            if (jogo.Estoque < item.Quantidade)
                throw new BusinessRuleException(BusinessErrors.ESTOQUE_INSUFICIENTE);
            jogos.Add((jogo, item.Quantidade));
        }

        foreach (var (jogo, quantidade) in jogos)
        {
            if (!await repositorios.Jogo.BaixarEstoqueSeDisponivelAsync(jogo.Id, quantidade))
                throw new BusinessRuleException(BusinessErrors.ESTOQUE_INSUFICIENTE);
        }

        var pedido = new Pedido
        {
            IdUsuario = idUsuario,
            IdSituacao = SituacaoPedidoIds.Pendente,
            DataPedido = DateTime.UtcNow,
            Total = jogos.Sum(par => par.Jogo.Preco * par.Quantidade),
        };
        pedido.Id = await repositorios.Pedido.InserirAsync(pedido);
        var detalhes = new List<ItemPedidoDetalhe>();
        foreach (var (jogo, quantidade) in jogos)
        {
            var item = new ItemPedido
            {
                IdPedido = pedido.Id,
                IdJogo = jogo.Id,
                Quantidade = quantidade,
                ValorUnitario = jogo.Preco,
            };
            await repositorios.ItemPedido.InserirAsync(item);
            detalhes.Add(new ItemPedidoDetalhe(item, jogo.Nome));
        }
        transacao.Complete();
        return new PedidoDetalhe(pedido, "Pendente", detalhes);
    }

    public async Task<List<PedidoDetalhe>> MeusAsync()
    {
        var idUsuario = usuario.IdUsuario ?? throw new BusinessRuleException(BusinessErrors.USUARIO_NAO_AUTENTICADO);
        return await MontarDetalhesAsync(await repositorios.Pedido.ListarPorUsuarioAsync(idUsuario));
    }

    public async Task<PedidoDetalhe> BuscarPorIdAsync(int id)
    {
        var pedido = await repositorios.Pedido.BuscarPorIdAsync(id)
            ?? throw new BusinessRuleException(BusinessErrors.PEDIDO_NAO_ENCONTRADO);
        if (!usuario.EhAdministrador && pedido.IdUsuario != usuario.IdUsuario)
            throw new BusinessRuleException(BusinessErrors.PEDIDO_ACESSO_NEGADO);
        return (await MontarDetalhesAsync([pedido])).Single();
    }

    public async Task<List<PedidoDetalhe>> ListarAdministracaoAsync(int? idSituacao)
    {
        if (idSituacao.HasValue && await repositorios.SituacaoPedido.BuscarPorIdAsync(idSituacao.Value) is null)
            throw new BusinessRuleException(BusinessErrors.SITUACAO_PEDIDO_NAO_ENCONTRADA);
        return await MontarDetalhesAsync(await repositorios.Pedido.ListarTodosAsync(idSituacao));
    }

    public async Task AlterarSituacaoAsync(int id, int idSituacao)
    {
        var pedido = await repositorios.Pedido.BuscarPorIdAsync(id);
        if (pedido is null)
            throw new BusinessRuleException(BusinessErrors.PEDIDO_NAO_ENCONTRADO);
        if (await repositorios.SituacaoPedido.BuscarPorIdAsync(idSituacao) is null)
            throw new BusinessRuleException(BusinessErrors.SITUACAO_PEDIDO_NAO_ENCONTRADA);

        if (idSituacao == SituacaoPedidoIds.Cancelado)
        {
            await CancelarEReporEstoqueAsync(pedido, somentePendente: false);
            return;
        }

        if (pedido.IdSituacao == SituacaoPedidoIds.Cancelado)
            throw new BusinessRuleException(BusinessErrors.PEDIDO_NAO_CANCELAVEL);
        await repositorios.Pedido.AtualizarSituacaoAsync(id, idSituacao);
    }

    public async Task CancelarAsync(int id)
    {
        var idUsuario = usuario.IdUsuario ?? throw new BusinessRuleException(BusinessErrors.USUARIO_NAO_AUTENTICADO);
        var pedido = await repositorios.Pedido.BuscarPorIdAsync(id)
            ?? throw new BusinessRuleException(BusinessErrors.PEDIDO_NAO_ENCONTRADO);
        if (pedido.IdUsuario != idUsuario)
            throw new BusinessRuleException(BusinessErrors.PEDIDO_ACESSO_NEGADO);
        if (pedido.IdSituacao != SituacaoPedidoIds.Pendente)
            throw new BusinessRuleException(BusinessErrors.PEDIDO_NAO_CANCELAVEL);

        await CancelarEReporEstoqueAsync(pedido, somentePendente: true);
    }

    public Task<List<SituacaoPedido>> ListarSituacoesAsync() => repositorios.SituacaoPedido.ListarAsync();

    private async Task CancelarEReporEstoqueAsync(Pedido pedido, bool somentePendente)
    {
        using var transacao = new TransactionScope(
            TransactionScopeOption.Required,
            new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted, Timeout = TimeSpan.FromSeconds(30) },
            TransactionScopeAsyncFlowOption.Enabled);

        var cancelado = somentePendente
            ? await repositorios.Pedido.CancelarSePendenteAsync(pedido.Id)
            : await repositorios.Pedido.CancelarSeNaoCanceladoAsync(pedido.Id);

        if (!cancelado)
        {
            if (somentePendente)
                throw new BusinessRuleException(BusinessErrors.PEDIDO_NAO_CANCELAVEL);
            return;
        }

        var itens = await repositorios.ItemPedido.ListarPorPedidosAsync([pedido.Id]);
        foreach (var item in itens)
        {
            if (!await repositorios.Jogo.ReporEstoqueAsync(item.IdJogo, item.Quantidade))
                throw new BusinessRuleException(BusinessErrors.JOGO_NAO_ENCONTRADO);
        }

        transacao.Complete();
    }

    private async Task<List<PedidoDetalhe>> MontarDetalhesAsync(List<Pedido> pedidos)
    {
        if (pedidos.Count == 0) return [];
        var itens = await repositorios.ItemPedido.ListarPorPedidosAsync(pedidos.Select(pedido => pedido.Id).ToArray());
        var situacoes = await repositorios.SituacaoPedido.ListarAsync();
        var nomes = new Dictionary<int, string>();
        foreach (var idJogo in itens.Select(item => item.IdJogo).Distinct())
            nomes[idJogo] = (await repositorios.Jogo.BuscarPorIdAsync(idJogo))?.Nome ?? "Jogo indisponível";
        var clientes = new Dictionary<int, string>();
        foreach (var idUsuario in pedidos.Select(pedido => pedido.IdUsuario).Distinct())
            clientes[idUsuario] = (await repositorios.Usuario.BuscarPorIdAsync(idUsuario))?.Nome ?? "Cliente indisponível";

        return pedidos.Select(pedido => new PedidoDetalhe(
            pedido,
            situacoes.FirstOrDefault(situacao => situacao.Id == pedido.IdSituacao)?.Descricao ?? "Desconhecida",
            itens.Where(item => item.IdPedido == pedido.Id)
                .Select(item => new ItemPedidoDetalhe(item, nomes[item.IdJogo])).ToList(),
            clientes[pedido.IdUsuario])).ToList();
    }
}
