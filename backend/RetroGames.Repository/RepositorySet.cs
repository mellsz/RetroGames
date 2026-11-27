namespace RetroGames.Repository;

public sealed class RepositorySet : IRepositorySet
{
    public RepositorySet(RepositoryConfig config)
    {
        ArgumentNullException.ThrowIfNull(config);

        Plataforma = new PlataformaRepository(config);
        Jogo = new JogoRepository(config);
        JogoGenero = new JogoGeneroRepository(config);
        Genero = new GeneroRepository(config);
        CondicaoJogo = new CondicaoJogoRepository(config);
        Usuario = new UsuarioRepository(config);
        MensagemContato = new MensagemContatoRepository(config);
        Pedido = new PedidoRepository(config);
        ItemPedido = new ItemPedidoRepository(config);
        SituacaoPedido = new SituacaoPedidoRepository(config);
    }

    public IPlataformaRepository Plataforma { get; }

    public IJogoRepository Jogo { get; }

    public IJogoGeneroRepository JogoGenero { get; }

    public IGeneroRepository Genero { get; }

    public ICondicaoJogoRepository CondicaoJogo { get; }

    public IUsuarioRepository Usuario { get; }

    public IMensagemContatoRepository MensagemContato { get; }

    public IPedidoRepository Pedido { get; }

    public IItemPedidoRepository ItemPedido { get; }

    public ISituacaoPedidoRepository SituacaoPedido { get; }
}
