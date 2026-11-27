using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class GeneroService : IGeneroService
{
    private readonly IRepositorySet _repositorio;

    public GeneroService(IRepositorySet repositorio)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
    }

    public Task<List<Genero>> ListarAsync()
    {
        return _repositorio.Genero.ListarAsync();
    }

    public async Task<Genero> BuscarPorIdAsync(int id) =>
        await _repositorio.Genero.BuscarPorIdAsync(id)
        ?? throw new BusinessRuleException(BusinessErrors.GENERO_NAO_ENCONTRADO);

    public async Task<Genero> InserirAsync(Genero genero)
    {
        ArgumentNullException.ThrowIfNull(genero);
        genero.Nome = genero.Nome.Trim();
        if (await _repositorio.Genero.ExisteComNomeAsync(genero.Nome))
            throw new BusinessRuleException(BusinessErrors.GENERO_NOME_DUPLICADO);
        try
        {
            genero.Id = await _repositorio.Genero.InserirAsync(genero);
            return genero;
        }
        catch (RegistroDuplicadoException)
        {
            throw new BusinessRuleException(BusinessErrors.GENERO_NOME_DUPLICADO);
        }
    }

    public async Task AlterarAsync(Genero genero)
    {
        ArgumentNullException.ThrowIfNull(genero);
        await BuscarPorIdAsync(genero.Id);
        genero.Nome = genero.Nome.Trim();
        if (await _repositorio.Genero.ExisteComNomeAsync(genero.Nome, genero.Id))
            throw new BusinessRuleException(BusinessErrors.GENERO_NOME_DUPLICADO);
        try
        {
            await _repositorio.Genero.AlterarAsync(genero);
        }
        catch (RegistroDuplicadoException)
        {
            throw new BusinessRuleException(BusinessErrors.GENERO_NOME_DUPLICADO);
        }
    }

    public async Task ExcluirAsync(int id)
    {
        await BuscarPorIdAsync(id);
        if (await _repositorio.JogoGenero.PossuiJogosDoGeneroAsync(id))
            throw new BusinessRuleException(BusinessErrors.GENERO_POSSUI_JOGOS);
        await _repositorio.Genero.ExcluirAsync(id);
    }
}
