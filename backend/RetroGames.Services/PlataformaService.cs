using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class PlataformaService : IPlataformaService
{
    private readonly IRepositorySet _repositorio;

    public PlataformaService(IRepositorySet repositorio)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
    }

    public Task<List<Plataforma>> ListarAsync()
    {
        return _repositorio.Plataforma.ListarAsync();
    }

    public async Task<Plataforma> BuscarPorIdAsync(int id)
    {
        var plataforma = await _repositorio.Plataforma.BuscarPorIdAsync(id);
        return plataforma ?? throw new BusinessRuleException(BusinessErrors.PLATAFORMA_NAO_ENCONTRADA);
    }

    public async Task<Plataforma> InserirAsync(Plataforma plataforma)
    {
        ArgumentNullException.ThrowIfNull(plataforma);

        plataforma.Nome = plataforma.Nome.Trim();
        if (await _repositorio.Plataforma.ExisteComNomeAsync(plataforma.Nome))
        {
            throw new BusinessRuleException(BusinessErrors.PLATAFORMA_NOME_DUPLICADO);
        }

        try
        {
            plataforma.Id = await _repositorio.Plataforma.InserirAsync(plataforma);
            return plataforma;
        }
        catch (RegistroDuplicadoException)
        {
            throw new BusinessRuleException(BusinessErrors.PLATAFORMA_NOME_DUPLICADO);
        }
    }

    public async Task AlterarAsync(Plataforma plataforma)
    {
        ArgumentNullException.ThrowIfNull(plataforma);

        await BuscarPorIdAsync(plataforma.Id);

        plataforma.Nome = plataforma.Nome.Trim();
        if (await _repositorio.Plataforma.ExisteComNomeAsync(plataforma.Nome, plataforma.Id))
        {
            throw new BusinessRuleException(BusinessErrors.PLATAFORMA_NOME_DUPLICADO);
        }

        try
        {
            await _repositorio.Plataforma.AlterarAsync(plataforma);
        }
        catch (RegistroDuplicadoException)
        {
            throw new BusinessRuleException(BusinessErrors.PLATAFORMA_NOME_DUPLICADO);
        }
    }

    public async Task ExcluirAsync(int id)
    {
        await BuscarPorIdAsync(id);

        if (await _repositorio.Plataforma.PossuiJogosAsync(id))
        {
            throw new BusinessRuleException(BusinessErrors.PLATAFORMA_POSSUI_JOGOS);
        }

        await _repositorio.Plataforma.ExcluirAsync(id);
    }
}
