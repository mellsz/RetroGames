using System.Security.Claims;
using RetroGames.Model.Constantes;
using RetroGames.Model.Model;

namespace RetroGames.WebApi.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static ClaimsPrincipal ParaClaimsPrincipal(this Usuario usuario)
    {
        ArgumentNullException.ThrowIfNull(usuario);

        var perfil = usuario.IdPerfil == PerfilIds.Administrador
            ? "Administrador"
            : "Cliente";
        var identidade = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, perfil),
        ], "Cookie");

        return new ClaimsPrincipal(identidade);
    }

    public static int? ObterIdUsuario(this ClaimsPrincipal usuario)
    {
        var valor = usuario.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(valor, out var id) ? id : null;
    }
}
