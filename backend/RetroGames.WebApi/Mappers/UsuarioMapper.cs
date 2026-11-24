using RetroGames.Model.Constantes;
using RetroGames.Model.Model;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Mappers;

public static class UsuarioMapper
{
    public static UsuarioLogadoResponseApiModel ParaResponse(this Usuario usuario)
    {
        ArgumentNullException.ThrowIfNull(usuario);

        return new UsuarioLogadoResponseApiModel
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Perfil = usuario.IdPerfil == PerfilIds.Administrador
                ? "Administrador"
                : "Cliente",
        };
    }
}
