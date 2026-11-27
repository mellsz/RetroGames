using MySqlConnector;
using RetroGames.Model.Model;

namespace RetroGames.Repository;

public sealed class JogoRepository : RepositoryBase, IJogoRepository
{
    public JogoRepository(RepositoryConfig config)
        : base(config)
    {
    }

    public async Task<(List<Jogo> Jogos, int TotalEncontrado)> ListarAsync(
        string? busca = null,
        int? idPlataforma = null,
        IReadOnlyCollection<int>? idsJogos = null,
        bool incluirInativos = false,
        int pagina = 1,
        int tamanhoPagina = 10)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(pagina, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(tamanhoPagina, 1);

        var ids = idsJogos?.Distinct().ToArray();
        if (ids is { Length: 0 })
        {
            return ([], 0);
        }

        var filtros = new List<string>();
        if (!incluirInativos)
        {
            filtros.Add("st_ativo = TRUE");
        }

        if (!string.IsNullOrWhiteSpace(busca))
        {
            filtros.Add("no_jogo LIKE @busca");
        }

        if (idPlataforma.HasValue)
        {
            filtros.Add("co_plataforma = @idPlataforma");
        }

        if (ids is not null)
        {
            filtros.Add($"co_seq_jogo IN ({string.Join(", ", ids.Select((_, i) => $"@idJogo{i}"))})");
        }

        var where = filtros.Count == 0 ? string.Empty : $"WHERE {string.Join(" AND ", filtros)}";
        const string colunas = """
            co_seq_jogo, no_jogo, ds_jogo, ds_imagem, nu_ano_lancamento, vl_preco,
            qt_estoque, st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo
            """;

        var sqlContagem = $"SELECT COUNT(*) FROM tb_jogo {where};";
        var sqlLista = $"""
            SELECT {colunas}
            FROM tb_jogo
            {where}
            ORDER BY no_jogo
            LIMIT @tamanhoPagina OFFSET @deslocamento;
            """;

        var deslocamento = checked((pagina - 1) * tamanhoPagina);
        await using var conexao = await AbrirConexaoAsync();

        int totalEncontrado;
        await using (var comandoContagem = CriarComando(conexao, sqlContagem))
        {
            AdicionarParametrosFiltros(comandoContagem, busca, idPlataforma, ids);
            totalEncontrado = Convert.ToInt32(await comandoContagem.ExecuteScalarAsync());
        }

        var jogos = new List<Jogo>();
        await using (var comandoLista = CriarComando(conexao, sqlLista))
        {
            AdicionarParametrosFiltros(comandoLista, busca, idPlataforma, ids);
            AdicionarParametro(comandoLista, "@tamanhoPagina", tamanhoPagina);
            AdicionarParametro(comandoLista, "@deslocamento", deslocamento);

            await using var leitor = await comandoLista.ExecuteReaderAsync();
            while (await leitor.ReadAsync())
            {
                jogos.Add(Mapear(leitor));
            }
        }

        return (jogos, totalEncontrado);
    }

    public async Task<Jogo?> BuscarPorIdAsync(int id)
    {
        const string sql = """
            SELECT co_seq_jogo, no_jogo, ds_jogo, ds_imagem, nu_ano_lancamento, vl_preco,
                   qt_estoque, st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo
            FROM tb_jogo
            WHERE co_seq_jogo = @id;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);

        await using var leitor = await comando.ExecuteReaderAsync();
        return await leitor.ReadAsync() ? Mapear(leitor) : null;
    }

    public async Task<int> InserirAsync(Jogo jogo)
    {
        ArgumentNullException.ThrowIfNull(jogo);

        const string sql = """
            INSERT INTO tb_jogo
                (no_jogo, ds_jogo, ds_imagem, nu_ano_lancamento, vl_preco, qt_estoque,
                 st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo)
            VALUES
                (@nome, @descricao, @imagem, @anoLancamento, @preco, @estoque,
                 @ativo, @dataCadastro, @idPlataforma, @idCondicaoJogo);
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametrosJogo(comando, jogo);

        await ExecutarGravacaoAsync(comando);
        return checked((int)comando.LastInsertedId);
    }

    public async Task AlterarAsync(Jogo jogo)
    {
        ArgumentNullException.ThrowIfNull(jogo);

        const string sql = """
            UPDATE tb_jogo
            SET no_jogo = @nome,
                ds_jogo = @descricao,
                ds_imagem = @imagem,
                nu_ano_lancamento = @anoLancamento,
                vl_preco = @preco,
                qt_estoque = @estoque,
                st_ativo = @ativo,
                co_plataforma = @idPlataforma,
                co_condicao_jogo = @idCondicaoJogo
            WHERE co_seq_jogo = @id;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", jogo.Id);
        AdicionarParametrosJogo(comando, jogo);

        await ExecutarGravacaoAsync(comando);
    }

    public async Task AtualizarSituacaoAsync(int id, bool ativo)
    {
        const string sql = """
            UPDATE tb_jogo
            SET st_ativo = @ativo
            WHERE co_seq_jogo = @id;
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        AdicionarParametro(comando, "@ativo", ativo);

        await ExecutarGravacaoAsync(comando);
    }

    public async Task<bool> BaixarEstoqueSeDisponivelAsync(int id, int quantidade)
    {
        const string sql = """
            UPDATE tb_jogo
            SET qt_estoque = qt_estoque - @quantidade
            WHERE co_seq_jogo = @id AND st_ativo = TRUE AND qt_estoque >= @quantidade;
            """;
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        AdicionarParametro(comando, "@quantidade", quantidade);
        return await ExecutarGravacaoAsync(comando) == 1;
    }

    public async Task<bool> ReporEstoqueAsync(int id, int quantidade)
    {
        const string sql = """
            UPDATE tb_jogo
            SET qt_estoque = qt_estoque + @quantidade
            WHERE co_seq_jogo = @id;
            """;
        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@id", id);
        AdicionarParametro(comando, "@quantidade", quantidade);
        return await ExecutarGravacaoAsync(comando) == 1;
    }

    private static void AdicionarParametrosFiltros(
        MySqlCommand comando,
        string? busca,
        int? idPlataforma,
        IReadOnlyList<int>? ids)
    {
        if (!string.IsNullOrWhiteSpace(busca))
        {
            AdicionarParametro(comando, "@busca", $"%{busca}%");
        }

        if (idPlataforma.HasValue)
        {
            AdicionarParametro(comando, "@idPlataforma", idPlataforma.Value);
        }

        if (ids is null)
        {
            return;
        }

        for (var i = 0; i < ids.Count; i++)
        {
            AdicionarParametro(comando, $"@idJogo{i}", ids[i]);
        }
    }

    private static void AdicionarParametrosJogo(MySqlCommand comando, Jogo jogo)
    {
        AdicionarParametro(comando, "@nome", jogo.Nome);
        AdicionarParametro(comando, "@descricao", jogo.Descricao);
        AdicionarParametro(comando, "@imagem", jogo.Imagem);
        AdicionarParametro(comando, "@anoLancamento", jogo.AnoLancamento);
        AdicionarParametro(comando, "@preco", jogo.Preco);
        AdicionarParametro(comando, "@estoque", jogo.Estoque);
        AdicionarParametro(comando, "@ativo", jogo.Ativo);
        AdicionarParametro(comando, "@dataCadastro", jogo.DataCadastro);
        AdicionarParametro(comando, "@idPlataforma", jogo.IdPlataforma);
        AdicionarParametro(comando, "@idCondicaoJogo", jogo.IdCondicaoJogo);
    }

    private static Jogo Mapear(MySqlDataReader leitor)
    {
        return new Jogo
        {
            Id = leitor.GetInt32("co_seq_jogo"),
            Nome = leitor.GetString("no_jogo"),
            Descricao = leitor.IsDBNull(leitor.GetOrdinal("ds_jogo"))
                ? null
                : leitor.GetString("ds_jogo"),
            Imagem = leitor.IsDBNull(leitor.GetOrdinal("ds_imagem"))
                ? null
                : leitor.GetString("ds_imagem"),
            AnoLancamento = leitor.GetInt32("nu_ano_lancamento"),
            Preco = leitor.GetDecimal("vl_preco"),
            Estoque = leitor.GetInt32("qt_estoque"),
            Ativo = leitor.GetBoolean("st_ativo"),
            DataCadastro = leitor.GetDateTime("dt_cadastro"),
            IdPlataforma = leitor.GetInt32("co_plataforma"),
            IdCondicaoJogo = leitor.GetInt32("co_condicao_jogo"),
        };
    }
}
