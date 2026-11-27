using RetroGames.Model.Model;

namespace RetroGames.Services;

public interface IPedidoService
{
    Task<PedidoDetalhe> CriarAsync(IReadOnlyCollection<ItemCompra> itens);
    Task<List<PedidoDetalhe>> MeusAsync();
    Task<PedidoDetalhe> BuscarPorIdAsync(int id);
    Task<List<PedidoDetalhe>> ListarAdministracaoAsync(int? idSituacao);
    Task AlterarSituacaoAsync(int id, int idSituacao);
    Task CancelarAsync(int id);
    Task<List<SituacaoPedido>> ListarSituacoesAsync();
}
