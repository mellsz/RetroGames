namespace RetroGames.Repository;

public interface IRepositorySet
{
    IPlataformaRepository Plataforma { get; }

    IJogoRepository Jogo { get; }

    IJogoGeneroRepository JogoGenero { get; }

    IGeneroRepository Genero { get; }

    ICondicaoJogoRepository CondicaoJogo { get; }

    IUsuarioRepository Usuario { get; }

    IMensagemContatoRepository MensagemContato { get; }

    IPedidoRepository Pedido { get; }

    IItemPedidoRepository ItemPedido { get; }

    ISituacaoPedidoRepository SituacaoPedido { get; }
}
