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
}
