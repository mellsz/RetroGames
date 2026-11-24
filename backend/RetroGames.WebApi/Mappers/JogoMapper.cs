using RetroGames.WebApi.ApiModels;
using RetroGames.Services;

namespace RetroGames.WebApi.Mappers;

public static class JogoMapper
{
    public static RetroGames.Model.Model.Jogo ParaModel(this InserirJogoRequestApiModel request)
    {
        ArgumentNullException.ThrowIfNull(request);

        return new RetroGames.Model.Model.Jogo
        {
            Nome = request.Nome,
            Descricao = NormalizarDescricao(request.Descricao),
            AnoLancamento = request.AnoLancamento,
            Preco = request.Preco,
            Estoque = request.Estoque,
            Ativo = true,
            DataCadastro = DateTime.Now,
            IdPlataforma = request.IdPlataforma,
            IdCondicaoJogo = request.IdCondicaoJogo,
        };
    }

    public static RetroGames.Model.Model.Jogo ParaModel(this AlterarJogoRequestApiModel request, int id)
    {
        ArgumentNullException.ThrowIfNull(request);

        return new RetroGames.Model.Model.Jogo
        {
            Id = id,
            Nome = request.Nome,
            Descricao = NormalizarDescricao(request.Descricao),
            AnoLancamento = request.AnoLancamento,
            Preco = request.Preco,
            Estoque = request.Estoque,
            Ativo = request.Ativo,
            IdPlataforma = request.IdPlataforma,
            IdCondicaoJogo = request.IdCondicaoJogo,
        };
    }

    public static (string? Busca, int? IdPlataforma, int? IdGenero, int Pagina, int TamanhoPagina) ParaFiltro(
        this ListarJogoRequestApiModel request)
    {
        ArgumentNullException.ThrowIfNull(request);
        return (request.Busca, request.IdPlataforma, request.IdGenero, request.Pagina, request.TamanhoPagina);
    }

    public static ListarJogoResponseApiModel ParaListarResponse(this JogoDetalheServiceModel detalhe)
    {
        ArgumentNullException.ThrowIfNull(detalhe);

        return new ListarJogoResponseApiModel
        {
            Id = detalhe.Jogo.Id,
            Nome = detalhe.Jogo.Nome,
            AnoLancamento = detalhe.Jogo.AnoLancamento,
            Preco = detalhe.Jogo.Preco,
            Estoque = detalhe.Jogo.Estoque,
            Ativo = detalhe.Jogo.Ativo,
            NomePlataforma = detalhe.NomePlataforma,
            DescricaoCondicao = detalhe.DescricaoCondicao,
            Generos = detalhe.Generos.Select(genero => genero.Nome).ToList(),
        };
    }

    public static ListarPorIdJogoResponseApiModel ParaListarPorIdResponse(this JogoDetalheServiceModel detalhe)
    {
        ArgumentNullException.ThrowIfNull(detalhe);

        return new ListarPorIdJogoResponseApiModel
        {
            Id = detalhe.Jogo.Id,
            Nome = detalhe.Jogo.Nome,
            Descricao = detalhe.Jogo.Descricao,
            AnoLancamento = detalhe.Jogo.AnoLancamento,
            Preco = detalhe.Jogo.Preco,
            Estoque = detalhe.Jogo.Estoque,
            Ativo = detalhe.Jogo.Ativo,
            IdPlataforma = detalhe.Jogo.IdPlataforma,
            NomePlataforma = detalhe.NomePlataforma,
            IdCondicaoJogo = detalhe.Jogo.IdCondicaoJogo,
            DescricaoCondicao = detalhe.DescricaoCondicao,
            Generos = detalhe.Generos.Select(genero => new GeneroJogoResponseApiModel
            {
                Id = genero.Id,
                Nome = genero.Nome,
            }).ToList(),
        };
    }

    private static string? NormalizarDescricao(string? descricao)
    {
        return string.IsNullOrWhiteSpace(descricao) ? null : descricao;
    }
}
