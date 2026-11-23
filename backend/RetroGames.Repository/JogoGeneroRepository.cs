using MySqlConnector;
using RetroGames.Model.Model;

namespace RetroGames.Repository;

public sealed class JogoGeneroRepository : RepositoryBase, IJogoGeneroRepository
{
    public JogoGeneroRepository(RepositoryConfig config)
        : base(config)
    {
    }

    public async Task<List<JogoGenero>> ListarTodosAsync()
    {
        const string sql = """
            SELECT co_jogo, co_genero
            FROM tb_jogo_genero
            ORDER BY co_jogo, co_genero;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        await using var leitor = await comando.ExecuteReaderAsync();

        var vinculos = new List<JogoGenero>();
        while (await leitor.ReadAsync())
        {
            vinculos.Add(Mapear(leitor));
        }

        return vinculos;
    }

    public async Task<List<JogoGenero>> ListarPorJogosAsync(IReadOnlyCollection<int> idsJogos)
    {
        ArgumentNullException.ThrowIfNull(idsJogos);
        var ids = idsJogos.Distinct().ToArray();
        if (ids.Length == 0)
        {
            return [];
        }

        var parametros = ids.Select((_, indice) => $"@idJogo{indice}");
        var sql = $"""
            SELECT co_jogo, co_genero
            FROM tb_jogo_genero
            WHERE co_jogo IN ({string.Join(", ", parametros)})
            ORDER BY co_jogo, co_genero;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        for (var i = 0; i < ids.Length; i++)
        {
            AdicionarParametro(comando, $"@idJogo{i}", ids[i]);
        }

        await using var leitor = await comando.ExecuteReaderAsync();
        var vinculos = new List<JogoGenero>();
        while (await leitor.ReadAsync())
        {
            vinculos.Add(Mapear(leitor));
        }

        return vinculos;
    }

    public async Task InserirAsync(JogoGenero jogoGenero)
    {
        ArgumentNullException.ThrowIfNull(jogoGenero);

        const string sql = """
            INSERT INTO tb_jogo_genero (co_jogo, co_genero)
            VALUES (@idJogo, @idGenero);
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@idJogo", jogoGenero.IdJogo);
        AdicionarParametro(comando, "@idGenero", jogoGenero.IdGenero);

        await ExecutarGravacaoAsync(comando);
    }

    public async Task RemoverPorJogoAsync(int idJogo)
    {
        const string sql = """
            DELETE FROM tb_jogo_genero
            WHERE co_jogo = @idJogo;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@idJogo", idJogo);

        await ExecutarGravacaoAsync(comando);
    }

    private static JogoGenero Mapear(MySqlDataReader leitor)
    {
        return new JogoGenero
        {
            IdJogo = leitor.GetInt32("co_jogo"),
            IdGenero = leitor.GetInt32("co_genero"),
        };
    }
}
