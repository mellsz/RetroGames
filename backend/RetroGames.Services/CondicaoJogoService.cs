using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class CondicaoJogoService : ICondicaoJogoService
{
    private readonly IRepositorySet _repositorio;

    public CondicaoJogoService(IRepositorySet repositorio)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
    }

    public Task<List<CondicaoJogo>> ListarAsync()
    {
        return _repositorio.CondicaoJogo.ListarAsync();
    }
}
