using MySqlConnector;
using RetroGames.Model.Model;

namespace RetroGames.Repository;

public sealed class GeneroRepository : RepositoryBase, IGeneroRepository
{
    public GeneroRepository(RepositoryConfig config)
        : base(config)
    {
    }

    public async Task<List<Genero>> ListarAsync()
    {
        const string sql = """
            SELECT co_seq_genero, no_genero
            FROM tb_genero
            ORDER BY no_genero;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        await using var leitor = await comando.ExecuteReaderAsync();

        var generos = new List<Genero>();
        while (await leitor.ReadAsync())
        {
            generos.Add(new Genero
            {
                Id = leitor.GetInt32("co_seq_genero"),
                Nome = leitor.GetString("no_genero"),
            });
        }

        return generos;
    }

    public async Task<Genero?> BuscarPorIdAsync(int id)
    {
        const string sql = "SELECT co_seq_genero, no_genero FROM tb_genero WHERE co_seq_genero = @id;";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        await using var leitor = await comando.ExecuteReaderAsync();
        return await leitor.ReadAsync() ? new Genero { Id = leitor.GetInt32("co_seq_genero"), Nome = leitor.GetString("no_genero") } : null;
    }

    public async Task<bool> ExisteComNomeAsync(string nome, int? ignorarId = null)
    {
        const string sql = "SELECT EXISTS(SELECT 1 FROM tb_genero WHERE no_genero = @nome AND (@ignorarId IS NULL OR co_seq_genero <> @ignorarId));";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@nome", nome);
        AdicionarParametro(comando, "@ignorarId", ignorarId);
        return Convert.ToInt32(await comando.ExecuteScalarAsync()) != 0;
    }

    public async Task<int> InserirAsync(Genero genero)
    {
        const string sql = "INSERT INTO tb_genero (no_genero) VALUES (@nome);";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@nome", genero.Nome);
        await ExecutarGravacaoAsync(comando);
        return checked((int)comando.LastInsertedId);
    }

    public async Task AlterarAsync(Genero genero)
    {
        const string sql = "UPDATE tb_genero SET no_genero = @nome WHERE co_seq_genero = @id;";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", genero.Id);
        AdicionarParametro(comando, "@nome", genero.Nome);
        await ExecutarGravacaoAsync(comando);
    }

    public async Task ExcluirAsync(int id)
    {
        const string sql = "DELETE FROM tb_genero WHERE co_seq_genero = @id;";
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        await ExecutarGravacaoAsync(comando);
    }
}
