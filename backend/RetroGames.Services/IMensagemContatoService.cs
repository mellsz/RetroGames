namespace RetroGames.Services;

public interface IMensagemContatoService
{
    Task EnviarAsync(string mensagem);
}
