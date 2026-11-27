using Moq;
using System.Transactions;
using RetroGames.Model.Model;
using RetroGames.Repository;
using RetroGames.Services;

namespace RetroGames.WebApi.UnitTests.Services;

public sealed class PedidoServiceTests
{
    private readonly Mock<IRepositorySet> _repositorios = new();
    private readonly Mock<IJogoRepository> _jogos = new();
    private readonly Mock<IPedidoRepository> _pedidos = new();
    private readonly Mock<IItemPedidoRepository> _itens = new();
    private readonly Mock<ISituacaoPedidoRepository> _situacoes = new();
    private readonly Mock<IUsuarioAtualService> _usuario = new();

    private PedidoService CriarService()
    {
        _repositorios.SetupGet(r => r.Jogo).Returns(_jogos.Object);
        _repositorios.SetupGet(r => r.Pedido).Returns(_pedidos.Object);
        _repositorios.SetupGet(r => r.ItemPedido).Returns(_itens.Object);
        _repositorios.SetupGet(r => r.SituacaoPedido).Returns(_situacoes.Object);
        _usuario.SetupGet(r => r.IdUsuario).Returns(7);
        return new PedidoService(_repositorios.Object, _usuario.Object);
    }

    private static Jogo JogoValido(int id = 3) => new() { Id = id, Nome = "Mario", Preco = 50m, Estoque = 5, Ativo = true };

    [Fact]
    public async Task PedidoVazio_NaoGrava()
    {
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([]));
        Assert.Equal(3, erro.Erro.Code);
        _pedidos.Verify(r => r.InserirAsync(It.IsAny<Pedido>()), Times.Never);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    public async Task QuantidadeInvalida_NaoGrava(int quantidade)
    {
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([new ItemCompra(3, quantidade)]));
        Assert.Equal(3, erro.Erro.Code);
        _jogos.Verify(r => r.BaixarEstoqueSeDisponivelAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task JogoInexistente_NaoGrava()
    {
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([new ItemCompra(3, 1)]));
        Assert.Equal(110, erro.Erro.Code);
        _pedidos.Verify(r => r.InserirAsync(It.IsAny<Pedido>()), Times.Never);
    }

    [Fact]
    public async Task JogoInativo_NaoGrava()
    {
        var jogo = JogoValido(); jogo.Ativo = false;
        _jogos.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(jogo);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([new ItemCompra(3, 1)]));
        Assert.Equal(110, erro.Erro.Code);
    }

    [Fact]
    public async Task EstoqueInsuficiente_NaoGrava()
    {
        var jogo = JogoValido(); jogo.Estoque = 1;
        _jogos.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(jogo);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([new ItemCompra(3, 2)]));
        Assert.Equal(111, erro.Erro.Code);
        _pedidos.Verify(r => r.InserirAsync(It.IsAny<Pedido>()), Times.Never);
    }

    [Fact]
    public async Task CompraValida_CalculaPrecoGravaItensEBaixaEstoque()
    {
        _jogos.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(JogoValido());
        _jogos.Setup(r => r.BaixarEstoqueSeDisponivelAsync(3, 2)).ReturnsAsync(true);
        _pedidos.Setup(r => r.InserirAsync(It.IsAny<Pedido>())).ReturnsAsync(42);
        var resultado = await CriarService().CriarAsync([new ItemCompra(3, 2)]);
        Assert.Equal(42, resultado.Pedido.Id);
        Assert.Equal(100m, resultado.Pedido.Total);
        Assert.Equal(1, resultado.Pedido.IdSituacao);
        Assert.Equal(7, resultado.Pedido.IdUsuario);
        Assert.Equal(50m, Assert.Single(resultado.Itens).Item.ValorUnitario);
        _jogos.Verify(r => r.BaixarEstoqueSeDisponivelAsync(3, 2), Times.Once);
        _pedidos.Verify(r => r.InserirAsync(It.Is<Pedido>(p => p.Total == 100m)), Times.Once);
        _itens.Verify(r => r.InserirAsync(It.Is<ItemPedido>(i => i.IdPedido == 42 && i.IdJogo == 3 && i.Quantidade == 2 && i.ValorUnitario == 50m)), Times.Once);
    }

    [Fact]
    public async Task FalhaConcorrenteNaBaixa_NaoCriaPedido()
    {
        _jogos.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(JogoValido());
        _jogos.Setup(r => r.BaixarEstoqueSeDisponivelAsync(3, 2)).ReturnsAsync(false);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([new ItemCompra(3, 2)]));
        Assert.Equal(111, erro.Erro.Code);
        _pedidos.Verify(r => r.InserirAsync(It.IsAny<Pedido>()), Times.Never);
    }

    [Fact]
    public async Task FalhaNoSegundoJogo_DesfazBaixaDoPrimeiro()
    {
        var transacaoObservada = new ObservadorTransacao();
        _jogos.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(JogoValido(3));
        _jogos.Setup(r => r.BuscarPorIdAsync(4)).ReturnsAsync(JogoValido(4));
        _jogos.Setup(r => r.BaixarEstoqueSeDisponivelAsync(3, 1)).Returns(() =>
        {
            Transaction.Current!.EnlistVolatile(transacaoObservada, EnlistmentOptions.None);
            return Task.FromResult(true);
        });
        _jogos.Setup(r => r.BaixarEstoqueSeDisponivelAsync(4, 1)).ReturnsAsync(false);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CriarAsync([new ItemCompra(3, 1), new ItemCompra(4, 1)]));
        Assert.Equal(111, erro.Erro.Code);
        Assert.True(transacaoObservada.FezRollback);
        _pedidos.Verify(r => r.InserirAsync(It.IsAny<Pedido>()), Times.Never);
    }

    [Fact]
    public async Task FalhaAoGravarItem_PropagaParaRollback()
    {
        var transacaoObservada = new ObservadorTransacao();
        _jogos.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(JogoValido());
        _jogos.Setup(r => r.BaixarEstoqueSeDisponivelAsync(3, 1)).Returns(() =>
        {
            Transaction.Current!.EnlistVolatile(transacaoObservada, EnlistmentOptions.None);
            return Task.FromResult(true);
        });
        _pedidos.Setup(r => r.InserirAsync(It.IsAny<Pedido>())).ReturnsAsync(42);
        _itens.Setup(r => r.InserirAsync(It.IsAny<ItemPedido>())).ThrowsAsync(new InvalidOperationException("falha simulada"));
        await Assert.ThrowsAsync<InvalidOperationException>(() => CriarService().CriarAsync([new ItemCompra(3, 1)]));
        _pedidos.Verify(r => r.InserirAsync(It.IsAny<Pedido>()), Times.Once);
        Assert.True(transacaoObservada.FezRollback);
    }

    [Fact]
    public async Task PedidoDeOutroCliente_ProibeDetalhes()
    {
        _pedidos.Setup(r => r.BuscarPorIdAsync(42)).ReturnsAsync(new Pedido { Id = 42, IdUsuario = 8 });
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().BuscarPorIdAsync(42));
        Assert.Equal(113, erro.Erro.Code);
        _itens.Verify(r => r.ListarPorPedidosAsync(It.IsAny<IReadOnlyCollection<int>>()), Times.Never);
    }

    [Fact]
    public async Task ClienteCancelaPedidoPendente_RecolocaItensNoEstoque()
    {
        _pedidos.Setup(r => r.BuscarPorIdAsync(42)).ReturnsAsync(new Pedido { Id = 42, IdUsuario = 7, IdSituacao = 1 });
        _pedidos.Setup(r => r.CancelarSePendenteAsync(42)).ReturnsAsync(true);
        _itens.Setup(r => r.ListarPorPedidosAsync(It.Is<IReadOnlyCollection<int>>(ids => ids.Single() == 42)))
            .ReturnsAsync([new ItemPedido { IdPedido = 42, IdJogo = 3, Quantidade = 2 }]);
        _jogos.Setup(r => r.ReporEstoqueAsync(3, 2)).ReturnsAsync(true);

        await CriarService().CancelarAsync(42);

        _pedidos.Verify(r => r.CancelarSePendenteAsync(42), Times.Once);
        _jogos.Verify(r => r.ReporEstoqueAsync(3, 2), Times.Once);
    }

    [Fact]
    public async Task ClienteNaoCancelaPedidoQueNaoEstaPendente()
    {
        _pedidos.Setup(r => r.BuscarPorIdAsync(42)).ReturnsAsync(new Pedido { Id = 42, IdUsuario = 7, IdSituacao = 2 });

        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().CancelarAsync(42));

        Assert.Equal(116, erro.Erro.Code);
        _pedidos.Verify(r => r.CancelarSePendenteAsync(It.IsAny<int>()), Times.Never);
        _jogos.Verify(r => r.ReporEstoqueAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task AdministradorCancelaPedido_RecolocaItensNoEstoqueUmaUnicaVez()
    {
        _pedidos.Setup(r => r.BuscarPorIdAsync(42)).ReturnsAsync(new Pedido { Id = 42, IdUsuario = 8, IdSituacao = 2 });
        _situacoes.Setup(r => r.BuscarPorIdAsync(4)).ReturnsAsync(new SituacaoPedido { Id = 4, Descricao = "Cancelado" });
        _pedidos.Setup(r => r.CancelarSeNaoCanceladoAsync(42)).ReturnsAsync(true);
        _itens.Setup(r => r.ListarPorPedidosAsync(It.Is<IReadOnlyCollection<int>>(ids => ids.Single() == 42)))
            .ReturnsAsync([new ItemPedido { IdPedido = 42, IdJogo = 3, Quantidade = 2 }]);
        _jogos.Setup(r => r.ReporEstoqueAsync(3, 2)).ReturnsAsync(true);

        await CriarService().AlterarSituacaoAsync(42, 4);

        _pedidos.Verify(r => r.CancelarSeNaoCanceladoAsync(42), Times.Once);
        _jogos.Verify(r => r.ReporEstoqueAsync(3, 2), Times.Once);
        _pedidos.Verify(r => r.AtualizarSituacaoAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    private sealed class ObservadorTransacao : IEnlistmentNotification
    {
        public bool FezRollback { get; private set; }
        public void Prepare(PreparingEnlistment enlistment) => enlistment.Prepared();
        public void Commit(Enlistment enlistment) => enlistment.Done();
        public void Rollback(Enlistment enlistment) { FezRollback = true; enlistment.Done(); }
        public void InDoubt(Enlistment enlistment) => enlistment.Done();
    }
}
