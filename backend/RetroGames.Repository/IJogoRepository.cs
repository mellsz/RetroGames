using RetroGames.Model.Model;

namespace RetroGames.Repository;

public interface IJogoRepository
{
    Task<(List<Jogo> Jogos, int TotalEncontrado)> ListarAsync(
        string? busca = null,
        int? idPlataforma = null,
        IReadOnlyCollection<int>? idsJogos = null,
        bool incluirInativos = false,
        int pagina = 1,
        int tamanhoPagina = 10);

    Task<Jogo?> BuscarPorIdAsync(int id);

    Task<int> InserirAsync(Jogo jogo);

    Task AlterarAsync(Jogo jogo);

    Task AtualizarSituacaoAsync(int id, bool ativo);

    Task<bool> BaixarEstoqueSeDisponivelAsync(int id, int quantidade);

    Task<bool> ReporEstoqueAsync(int id, int quantidade);
}
