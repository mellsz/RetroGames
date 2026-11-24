using System.Transactions;
using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class JogoService : IJogoService
{
    private readonly IRepositorySet _repositorio;

    public JogoService(IRepositorySet repositorio)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
    }

    public async Task<(List<JogoDetalheServiceModel> Jogos, int TotalEncontrado)> ListarAsync(
        string? busca = null,
        int? idPlataforma = null,
        int? idGenero = null,
        int pagina = 1,
        int tamanhoPagina = 10)
    {
        IReadOnlyCollection<int>? idsJogos = null;
        if (idGenero.HasValue)
        {
            var vinculos = await _repositorio.JogoGenero.ListarTodosAsync();
            idsJogos = vinculos
                .Where(vinculo => vinculo.IdGenero == idGenero.Value)
                .Select(vinculo => vinculo.IdJogo)
                .ToArray();
        }

        var (jogos, totalEncontrado) = await _repositorio.Jogo.ListarAsync(
            busca,
            idPlataforma,
            idsJogos,
            incluirInativos: false,
            pagina,
            tamanhoPagina);

        return (await MontarDetalhesAsync(jogos), totalEncontrado);
    }

    public async Task<JogoDetalheServiceModel> BuscarPorIdAsync(int id)
    {
        var jogo = await _repositorio.Jogo.BuscarPorIdAsync(id)
            ?? throw new BusinessRuleException(BusinessErrors.JOGO_NAO_ENCONTRADO);

        return (await MontarDetalhesAsync([jogo])).Single();
    }

    public async Task<Jogo> InserirAsync(Jogo jogo, IReadOnlyCollection<int> idsGeneros)
    {
        ArgumentNullException.ThrowIfNull(jogo);
        var generos = await ValidarReferenciasAsync(jogo, idsGeneros);

        jogo.Nome = jogo.Nome.Trim();
        jogo.Ativo = true;

        using var transactionScope = CriarTransactionScope();
        jogo.Id = await _repositorio.Jogo.InserirAsync(jogo);
        foreach (var idGenero in generos)
        {
            await _repositorio.JogoGenero.InserirAsync(new JogoGenero
            {
                IdJogo = jogo.Id,
                IdGenero = idGenero,
            });
        }

        transactionScope.Complete();
        return jogo;
    }

    public async Task AlterarAsync(Jogo jogo, IReadOnlyCollection<int> idsGeneros)
    {
        ArgumentNullException.ThrowIfNull(jogo);
        await GarantirJogoExisteAsync(jogo.Id);
        var generos = await ValidarReferenciasAsync(jogo, idsGeneros);

        jogo.Nome = jogo.Nome.Trim();

        using var transactionScope = CriarTransactionScope();
        await _repositorio.Jogo.AlterarAsync(jogo);
        await _repositorio.JogoGenero.RemoverPorJogoAsync(jogo.Id);
        foreach (var idGenero in generos)
        {
            await _repositorio.JogoGenero.InserirAsync(new JogoGenero
            {
                IdJogo = jogo.Id,
                IdGenero = idGenero,
            });
        }

        transactionScope.Complete();
    }

    public async Task DesativarAsync(int id)
    {
        await GarantirJogoExisteAsync(id);
        await _repositorio.Jogo.DesativarAsync(id);
    }

    private async Task<List<JogoDetalheServiceModel>> MontarDetalhesAsync(IReadOnlyCollection<Jogo> jogos)
    {
        var plataformasTask = _repositorio.Plataforma.ListarAsync();
        var condicoesTask = _repositorio.CondicaoJogo.ListarAsync();
        var generosTask = _repositorio.Genero.ListarAsync();
        var vinculosTask = _repositorio.JogoGenero.ListarPorJogosAsync(jogos.Select(jogo => jogo.Id).ToArray());

        await Task.WhenAll(plataformasTask, condicoesTask, generosTask, vinculosTask);

        var plataformas = await plataformasTask;
        var condicoes = await condicoesTask;
        var generos = await generosTask;
        var vinculos = await vinculosTask;

        return (from jogo in jogos
                join plataforma in plataformas on jogo.IdPlataforma equals plataforma.Id
                join condicao in condicoes on jogo.IdCondicaoJogo equals condicao.Id
                select new JogoDetalheServiceModel
                {
                    Jogo = jogo,
                    NomePlataforma = plataforma.Nome,
                    DescricaoCondicao = condicao.Descricao,
                    Generos = (from vinculo in vinculos
                                join genero in generos on vinculo.IdGenero equals genero.Id
                                where vinculo.IdJogo == jogo.Id
                                select genero).ToList(),
                }).ToList();
    }

    private async Task GarantirJogoExisteAsync(int id)
    {
        if (await _repositorio.Jogo.BuscarPorIdAsync(id) is null)
        {
            throw new BusinessRuleException(BusinessErrors.JOGO_NAO_ENCONTRADO);
        }
    }

    private async Task<int[]> ValidarReferenciasAsync(Jogo jogo, IReadOnlyCollection<int> idsGeneros)
    {
        ArgumentNullException.ThrowIfNull(idsGeneros);

        if (await _repositorio.Plataforma.BuscarPorIdAsync(jogo.IdPlataforma) is null)
        {
            throw new BusinessRuleException(BusinessErrors.PLATAFORMA_NAO_ENCONTRADA);
        }

        var condicoesTask = _repositorio.CondicaoJogo.ListarAsync();
        var generosTask = _repositorio.Genero.ListarAsync();
        await Task.WhenAll(condicoesTask, generosTask);

        if (!(await condicoesTask).Any(condicao => condicao.Id == jogo.IdCondicaoJogo))
        {
            throw new BusinessRuleException(BusinessErrors.CONDICAO_NAO_ENCONTRADA);
        }

        var idsDistintos = idsGeneros.Distinct().ToArray();
        var idsExistentes = (await generosTask).Select(genero => genero.Id).ToHashSet();
        if (idsDistintos.Length == 0 || idsDistintos.Any(idGenero => !idsExistentes.Contains(idGenero)))
        {
            throw new BusinessRuleException(BusinessErrors.GENERO_NAO_ENCONTRADO);
        }

        return idsDistintos;
    }

    private static TransactionScope CriarTransactionScope()
    {
        var transactionOptions = new TransactionOptions
        {
            IsolationLevel = IsolationLevel.ReadCommitted,
            Timeout = TransactionManager.DefaultTimeout,
        };

        return new TransactionScope(
            TransactionScopeOption.Required,
            transactionOptions,
            TransactionScopeAsyncFlowOption.Enabled);
    }
}
