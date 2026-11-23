using MySqlConnector;

namespace RetroGames.Repository;

public abstract class RepositoryBase
{
    private readonly RepositoryConfig _config;

    protected RepositoryBase(RepositoryConfig config)
    {
        _config = config ?? throw new ArgumentNullException(nameof(config));
    }

    protected async Task<MySqlConnection> AbrirConexaoAsync(CancellationToken cancellationToken = default)
    {
        var conexao = new MySqlConnection(_config.ConnectionString);
        try
        {
            await conexao.OpenAsync(cancellationToken);
            return conexao;
        }
        catch
        {
            await conexao.DisposeAsync();
            throw;
        }
    }

    protected static MySqlCommand CriarComando(MySqlConnection conexao, string sql)
    {
        ArgumentNullException.ThrowIfNull(conexao);
        ArgumentException.ThrowIfNullOrWhiteSpace(sql);
        return new MySqlCommand(sql, conexao);
    }

    protected static void AdicionarParametro(MySqlCommand comando, string nome, object? valor)
    {
        ArgumentNullException.ThrowIfNull(comando);
        comando.Parameters.AddWithValue(nome, valor ?? DBNull.Value);
    }

    protected static async Task<int> ExecutarGravacaoAsync(
        MySqlCommand comando,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(comando);
        try
        {
            return await comando.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (MySqlException ex) when (ex.Number == 1062)
        {
            throw new RegistroDuplicadoException(ex);
        }
    }
}
