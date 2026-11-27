using RetroGames.Model.Model;

namespace RetroGames.Services;

public sealed record ItemCompra(int IdJogo, int Quantidade);

public sealed record ItemPedidoDetalhe(ItemPedido Item, string NomeJogo);

public sealed record PedidoDetalhe(Pedido Pedido, string Situacao, List<ItemPedidoDetalhe> Itens, string NomeCliente = "");
