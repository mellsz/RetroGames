namespace RetroGames.WebApi.ApiModels;

public sealed class ItemCompraRequestApiModel
{
    public int IdJogo { get; set; }
    public int Quantidade { get; set; }
}

public sealed class CriarPedidoRequestApiModel
{
    public List<ItemCompraRequestApiModel> Itens { get; set; } = [];
}

public sealed class AlterarSituacaoPedidoRequestApiModel
{
    public int IdSituacao { get; set; }
}

public sealed class ItemPedidoResponseApiModel
{
    public int IdJogo { get; set; }
    public string NomeJogo { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public sealed class PedidoResponseApiModel
{
    public int Id { get; set; }
    public DateTime DataPedido { get; set; }
    public decimal Total { get; set; }
    public int IdUsuario { get; set; }
    public string NomeCliente { get; set; } = string.Empty;
    public int IdSituacao { get; set; }
    public string Situacao { get; set; } = string.Empty;
    public List<ItemPedidoResponseApiModel> Itens { get; set; } = [];
}

public sealed class SituacaoPedidoResponseApiModel
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
}
