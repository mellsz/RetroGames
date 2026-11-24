using RetroGames.Services;
using RetroGames.WebApi.Extensions;

namespace RetroGames.WebApi.Services;

public sealed class UsuarioAtualService : IUsuarioAtualService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UsuarioAtualService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor
            ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public bool EstaLogado => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;

    public int? IdUsuario => _httpContextAccessor.HttpContext?.User.ObterIdUsuario();

    public bool EhAdministrador => _httpContextAccessor.HttpContext?.User.IsInRole("Administrador") == true;
}
