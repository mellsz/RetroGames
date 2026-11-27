using RetroGames.Model.Model;

namespace RetroGames.Repository;

public interface IPedidoRepository
{
    Task<int> InserirAsync(Pedido pedido);
    Task<Pedido?> BuscarPorIdAsync(int id);
    Task<List<Pedido>> ListarPorUsuarioAsync(int idUsuario);
    Task<List<Pedido>> ListarTodosAsync(int? idSituacao);
    Task AtualizarSituacaoAsync(int id, int idSituacao);
    Task<bool> CancelarSePendenteAsync(int id);
    Task<bool> CancelarSeNaoCanceladoAsync(int id);
}
