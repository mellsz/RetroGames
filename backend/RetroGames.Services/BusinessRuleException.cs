using System.Net;

namespace RetroGames.Services;

public sealed class BusinessRuleException : Exception
{
    public BusinessRuleException((int Code, string DefaultMessage, HttpStatusCode Status) erro)
        : base(erro.DefaultMessage)
    {
        Erro = erro;
    }

    public (int Code, string DefaultMessage, HttpStatusCode Status) Erro { get; }
}
