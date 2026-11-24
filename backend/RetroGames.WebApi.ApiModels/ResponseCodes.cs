namespace RetroGames.WebApi.ApiModels;

public static class ResponseCodes
{
    public const int SUCESSO = 0;

    public const int ERRO = 1;

    public const int MODEL_NULL = 2;

    public const string MENSAGEM_MODEL_NULL = "O modelo veio nulo.";

    public const int MODEL_STATE_INVALIDO = 3;

    public const string MENSAGEM_MODEL_STATE_INVALIDO = "Há um erro com o modelo enviado.";

    public const int NAO_AUTENTICADO = 4;

    public const string MENSAGEM_NAO_AUTENTICADO = "Faça login para continuar.";

    public const int ACESSO_NEGADO = 5;

    public const string MENSAGEM_ACESSO_NEGADO = "Você não tem permissão para esta operação.";

    public const int CREDENCIAIS_INVALIDAS = 6;

    public const string MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha inválidos.";
}
