namespace RetroGames.Model.Model;

public class MensagemContato
{
    /// <summary>Coluna co_seq_mensagem_contato.</summary>
    public int Id { get; set; }

    /// <summary>Coluna ds_mensagem.</summary>
    public string Mensagem { get; set; } = string.Empty;

    /// <summary>Coluna dt_envio.</summary>
    public DateTime DataEnvio { get; set; }

    /// <summary>Coluna co_usuario.</summary>
    public int IdUsuario { get; set; }
}
