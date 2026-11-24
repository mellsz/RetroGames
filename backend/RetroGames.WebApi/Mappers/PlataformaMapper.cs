using RetroGames.Model.Model;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Mappers;

public static class PlataformaMapper
{
    public static Plataforma ParaModel(this InserirPlataformaRequestApiModel request)
    {
        ArgumentNullException.ThrowIfNull(request);

        return new Plataforma
        {
            Nome = request.Nome,
            Fabricante = request.Fabricante,
            AnoLancamento = request.AnoLancamento,
        };
    }

    public static Plataforma ParaModel(this AlterarPlataformaRequestApiModel request, int id)
    {
        ArgumentNullException.ThrowIfNull(request);

        return new Plataforma
        {
            Id = id,
            Nome = request.Nome,
            Fabricante = request.Fabricante,
            AnoLancamento = request.AnoLancamento,
        };
    }

    public static ListarPlataformaResponseApiModel ParaResponse(this Plataforma plataforma)
    {
        ArgumentNullException.ThrowIfNull(plataforma);

        return new ListarPlataformaResponseApiModel
        {
            Id = plataforma.Id,
            Nome = plataforma.Nome,
            Fabricante = plataforma.Fabricante,
            AnoLancamento = plataforma.AnoLancamento,
        };
    }
}
