namespace RetroGames.Model.Model;

public sealed class Pedido
{
    public int Id { get; set; }
    public DateTime DataPedido { get; set; }
    public decimal Total { get; set; }
    public int IdUsuario { get; set; }
    public int IdSituacao { get; set; } = 1;
}
