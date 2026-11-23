using RetroGames.Model.Model;

namespace RetroGames.Repository;

public interface IJogoGeneroRepository
{
    Task<List<JogoGenero>> ListarTodosAsync();

    Task<List<JogoGenero>> ListarPorJogosAsync(IReadOnlyCollection<int> idsJogos);

    Task InserirAsync(JogoGenero jogoGenero);

    Task RemoverPorJogoAsync(int idJogo);
}
