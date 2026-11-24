using Microsoft.AspNetCore.Authentication.Cookies;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Configuration;

public static class AutenticacaoConfig
{
    public static IServiceCollection AddAutenticacao(this IServiceCollection services)
    {
        services
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "retrogames.sessao";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.ExpireTimeSpan = TimeSpan.FromHours(2);
                options.SlidingExpiration = true;
                options.Events.OnRedirectToLogin = context => ResponderErroAsync(
                    context.HttpContext,
                    StatusCodes.Status401Unauthorized,
                    ResponseCodes.NAO_AUTENTICADO,
                    ResponseCodes.MENSAGEM_NAO_AUTENTICADO);
                options.Events.OnRedirectToAccessDenied = context => ResponderErroAsync(
                    context.HttpContext,
                    StatusCodes.Status403Forbidden,
                    ResponseCodes.ACESSO_NEGADO,
                    ResponseCodes.MENSAGEM_ACESSO_NEGADO);
            });

        services.AddAuthorization();
        return services;
    }

    private static Task ResponderErroAsync(
        HttpContext httpContext,
        int statusCode,
        int responseCode,
        string mensagem)
    {
        httpContext.Response.StatusCode = statusCode;
        return httpContext.Response.WriteAsJsonAsync(new RetroGamesResponseApiModel
        {
            ResponseCode = responseCode,
            ErrorMessage = mensagem,
        });
    }
}
