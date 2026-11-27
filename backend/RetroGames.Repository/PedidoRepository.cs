using MySqlConnector;
using RetroGames.Model.Model;

namespace RetroGames.Repository;

public sealed class PedidoRepository(RepositoryConfig config) : RepositoryBase(config), IPedidoRepository
{
    private const string Colunas = "co_seq_pedido, dt_pedido, vl_total, co_usuario, co_situacao_pedido";

    public async Task<int> InserirAsync(Pedido pedido)
    {
        const string sql = """
            INSERT INTO tb_pedido (dt_pedido, vl_total, co_usuario, co_situacao_pedido)
            VALUES (@data, @total, @usuario, @situacao);
            """;
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@data", pedido.DataPedido);
        AdicionarParametro(comando, "@total", pedido.Total);
        AdicionarParametro(comando, "@usuario", pedido.IdUsuario);
        AdicionarParametro(comando, "@situacao", pedido.IdSituacao);
        await ExecutarGravacaoAsync(comando);
        return checked((int)comando.LastInsertedId);
    }

    public async Task<Pedido?> BuscarPorIdAsync(int id)
    {
        var sql = $"SELECT {Colunas} FROM tb_pedido WHERE co_seq_pedido = @id;";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        await using var leitor = await comando.ExecuteReaderAsync();
        return await leitor.ReadAsync() ? Mapear(leitor) : null;
    }

    public async Task<List<Pedido>> ListarPorUsuarioAsync(int idUsuario)
    {
        var sql = $"SELECT {Colunas} FROM tb_pedido WHERE co_usuario = @usuario ORDER BY dt_pedido DESC, co_seq_pedido DESC;";
        return await ListarAsync(sql, "@usuario", idUsuario);
    }

    public async Task<List<Pedido>> ListarTodosAsync(int? idSituacao)
    {
        var sql = $"SELECT {Colunas} FROM tb_pedido WHERE (@situacao IS NULL OR co_situacao_pedido = @situacao) ORDER BY dt_pedido DESC, co_seq_pedido DESC;";
        return await ListarAsync(sql, "@situacao", idSituacao);
    }

    public async Task AtualizarSituacaoAsync(int id, int idSituacao)
    {
        const string sql = "UPDATE tb_pedido SET co_situacao_pedido = @situacao WHERE co_seq_pedido = @id;";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        AdicionarParametro(comando, "@situacao", idSituacao);
        await ExecutarGravacaoAsync(comando);
    }

    public Task<bool> CancelarSePendenteAsync(int id)
        => AtualizarParaCanceladoAsync(id, "co_situacao_pedido = 1");

    public Task<bool> CancelarSeNaoCanceladoAsync(int id)
        => AtualizarParaCanceladoAsync(id, "co_situacao_pedido <> 4");

    private async Task<bool> AtualizarParaCanceladoAsync(int id, string condicao)
    {
        var sql = $"UPDATE tb_pedido SET co_situacao_pedido = 4 WHERE co_seq_pedido = @id AND {condicao};";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        return await ExecutarGravacaoAsync(comando) == 1;
    }

    private async Task<List<Pedido>> ListarAsync(string sql, string parametro, object? valor)
    {
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, parametro, valor);
        await using var leitor = await comando.ExecuteReaderAsync();
        var pedidos = new List<Pedido>();
        while (await leitor.ReadAsync()) pedidos.Add(Mapear(leitor));
        return pedidos;
    }

    private static Pedido Mapear(MySqlDataReader leitor) => new()
    {
        Id = leitor.GetInt32("co_seq_pedido"),
        DataPedido = leitor.GetDateTime("dt_pedido"),
        Total = leitor.GetDecimal("vl_total"),
        IdUsuario = leitor.GetInt32("co_usuario"),
        IdSituacao = leitor.GetInt32("co_situacao_pedido"),
    };
}
