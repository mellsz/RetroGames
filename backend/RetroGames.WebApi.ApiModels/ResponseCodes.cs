namespace RetroGames.WebApi.ApiModels;

public static class ResponseCodes
{
    public const int SUCESSO = 0;

    public const int ERRO = 1;

    public const int MODEL_NULL = 2;

    public const string MENSAGEM_MODEL_NULL = "O modelo veio nulo.";

    public const int MODEL_STATE_INVALIDO = 3;

    public const string MENSAGEM_MODEL_STATE_INVALIDO = "Há um erro com o modelo enviado.";
}
