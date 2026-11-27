using System.Net;

namespace RetroGames.Services;

public static class BusinessErrors
{
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PLATAFORMA_NAO_ENCONTRADA =
        (100, "Plataforma não encontrada.", HttpStatusCode.NotFound);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PLATAFORMA_NOME_DUPLICADO =
        (101, "Já existe uma plataforma com este nome.", HttpStatusCode.Conflict);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PLATAFORMA_POSSUI_JOGOS =
        (102, "Não é possível excluir: existem jogos desta plataforma.", HttpStatusCode.Conflict);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) JOGO_NAO_ENCONTRADO =
        (103, "Jogo não encontrado.", HttpStatusCode.NotFound);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) CONDICAO_NAO_ENCONTRADA =
        (104, "Condição de jogo não encontrada.", HttpStatusCode.NotFound);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) GENERO_NAO_ENCONTRADO =
        (105, "Gênero não encontrado.", HttpStatusCode.NotFound);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) USUARIO_EMAIL_DUPLICADO =
        (106, "Já existe uma conta cadastrada com este e-mail.", HttpStatusCode.Conflict);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) USUARIO_NAO_AUTENTICADO =
        (114, "Faça login para continuar.", HttpStatusCode.Unauthorized);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) IMAGEM_JOGO_INVALIDA =
        (115, "Envie uma imagem JPG, PNG ou WEBP com no máximo 5 MB.", HttpStatusCode.BadRequest);

    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) GENERO_NOME_DUPLICADO =
        (107, "Já existe um gênero com este nome.", HttpStatusCode.Conflict);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) GENERO_POSSUI_JOGOS =
        (108, "Não é possível excluir: existem jogos deste gênero.", HttpStatusCode.Conflict);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PEDIDO_NAO_ENCONTRADO =
        (109, "Pedido não encontrado.", HttpStatusCode.NotFound);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) JOGO_INDISPONIVEL =
        (110, "Um jogo do pedido não existe ou está inativo.", HttpStatusCode.BadRequest);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) ESTOQUE_INSUFICIENTE =
        (111, "Estoque insuficiente para um jogo do pedido.", HttpStatusCode.Conflict);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) SITUACAO_PEDIDO_NAO_ENCONTRADA =
        (112, "Situação do pedido não encontrada.", HttpStatusCode.NotFound);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PEDIDO_ACESSO_NEGADO =
        (113, "Você não pode consultar este pedido.", HttpStatusCode.Forbidden);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PEDIDO_INVALIDO =
        (3, "Informe pelo menos um jogo, com quantidades de 1 a 10, sem repetições.", HttpStatusCode.BadRequest);
    public static readonly (int Code, string DefaultMessage, HttpStatusCode Status) PEDIDO_NAO_CANCELAVEL =
        (116, "Apenas pedidos pendentes podem ser cancelados.", HttpStatusCode.Conflict);
}
