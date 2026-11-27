using MySqlConnector;
using RetroGames.Model.Model;

namespace RetroGames.Repository;

public sealed class ItemPedidoRepository(RepositoryConfig config) : RepositoryBase(config), IItemPedidoRepository
{
    public async Task InserirAsync(ItemPedido item)
    {
        const string sql = """
            INSERT INTO tb_item_pedido (qt_item, vl_unitario, co_pedido, co_jogo)
            VALUES (@quantidade, @valor, @pedido, @jogo);
            """;
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@quantidade", item.Quantidade);
        AdicionarParametro(comando, "@valor", item.ValorUnitario);
        AdicionarParametro(comando, "@pedido", item.IdPedido);
        AdicionarParametro(comando, "@jogo", item.IdJogo);
        await ExecutarGravacaoAsync(comando);
    }

    public async Task<List<ItemPedido>> ListarPorPedidosAsync(IReadOnlyCollection<int> idsPedidos)
    {
        var ids = idsPedidos.Distinct().ToArray();
        if (ids.Length == 0) return [];
        var parametros = string.Join(", ", ids.Select((_, indice) => $"@pedido{indice}"));
        var sql = $"SELECT co_seq_item_pedido, qt_item, vl_unitario, co_pedido, co_jogo FROM tb_item_pedido WHERE co_pedido IN ({parametros}) ORDER BY co_seq_item_pedido;";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        for (var indice = 0; indice < ids.Length; indice++) AdicionarParametro(comando, $"@pedido{indice}", ids[indice]);
        await using var leitor = await comando.ExecuteReaderAsync();
        var itens = new List<ItemPedido>();
        while (await leitor.ReadAsync())
        {
            itens.Add(new ItemPedido
            {
                Id = leitor.GetInt32("co_seq_item_pedido"),
                Quantidade = leitor.GetInt32("qt_item"),
                ValorUnitario = leitor.GetDecimal("vl_unitario"),
                IdPedido = leitor.GetInt32("co_pedido"),
                IdJogo = leitor.GetInt32("co_jogo"),
            });
        }
        return itens;
    }
}
