using Microsoft.AspNetCore.Diagnostics;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Middlewares;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is BusinessRuleException businessRuleException)
        {
            httpContext.Response.StatusCode = (int)businessRuleException.Erro.Status;
            await httpContext.Response.WriteAsJsonAsync(new RetroGamesResponseApiModel
            {
                ResponseCode = businessRuleException.Erro.Code,
                ErrorMessage = businessRuleException.Message,
            }, cancellationToken);

            return true;
        }

        _logger.LogError(exception, "Erro inesperado ao processar a requisição.");

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(new RetroGamesResponseApiModel
        {
            ResponseCode = ResponseCodes.ERRO,
            ErrorMessage = "Ocorreu um erro inesperado.",
        }, cancellationToken);

        return true;
    }
}
