using MySqlConnector;
using RetroGames.Model.Model;

namespace RetroGames.Repository;

public sealed class MensagemContatoRepository : RepositoryBase, IMensagemContatoRepository
{
    public MensagemContatoRepository(RepositoryConfig config)
        : base(config)
    {
    }

    public async Task<int> InserirAsync(MensagemContato mensagemContato)
    {
        ArgumentNullException.ThrowIfNull(mensagemContato);

        const string sql = """
            INSERT INTO tb_mensagem_contato (ds_mensagem, dt_envio, co_usuario)
            VALUES (@mensagem, @dataEnvio, @idUsuario);
            """;

        await using var conexao = await AbrirConexaoAsync();
        await using var comando = CriarComando(conexao, sql);
        AdicionarParametro(comando, "@mensagem", mensagemContato.Mensagem);
        AdicionarParametro(comando, "@dataEnvio", mensagemContato.DataEnvio);
        AdicionarParametro(comando, "@idUsuario", mensagemContato.IdUsuario);

        await ExecutarGravacaoAsync(comando);
        return checked((int)comando.LastInsertedId);
    }
}
