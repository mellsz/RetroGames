using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace RetroGames.WebApi.Configuration;

public static class AutorizacaoConfig
{
    public static IServiceCollection AddAutorizacao(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder(
                    CookieAuthenticationDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(Politicas.Administrador, politica =>
                politica.RequireRole("Administrador"));
            options.AddPolicy(Politicas.Cliente, politica =>
                politica.RequireRole("Cliente"));
        });

        return services;
    }
}
