using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.ActionFilters;

public sealed class FluentValidationFilter : IAsyncActionFilter, IOrderedFilter
{
    private readonly IServiceProvider _serviceProvider;

    public FluentValidationFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
    }

    // Executa antes do filtro automático de ModelState do [ApiController].
    public int Order => -3000;

    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        foreach (var argumento in context.ActionArguments)
        {
            if (argumento.Value is null)
            {
                context.Result = new BadRequestObjectResult(new RetroGamesResponseApiModel
                {
                    ResponseCode = ResponseCodes.MODEL_NULL,
                    ErrorMessage = ResponseCodes.MENSAGEM_MODEL_NULL,
                });
                return;
            }
        }

        if (!context.ModelState.IsValid)
        {
            context.Result = new BadRequestObjectResult(CriarRespostaModeloInvalido(context.ModelState));
            return;
        }

        foreach (var argumento in context.ActionArguments)
        {
            var tipoValidador = typeof(IValidator<>).MakeGenericType(argumento.Value!.GetType());
            if (_serviceProvider.GetService(tipoValidador) is not IValidator validador)
            {
                continue;
            }

            var resultado = await validador.ValidateAsync(
                new ValidationContext<object>(argumento.Value),
                context.HttpContext.RequestAborted);

            if (resultado.IsValid)
            {
                continue;
            }

            var erros = resultado.Errors
                .GroupBy(erro => ConverterParaCamelCase(erro.PropertyName))
                .ToDictionary(
                    grupo => grupo.Key,
                    grupo => grupo.Select(erro => erro.ErrorMessage).ToArray());

            context.Result = new BadRequestObjectResult(CriarRespostaModeloInvalido(erros));
            return;
        }

        await next();
    }

    public static RetroGamesResponseApiModel<Dictionary<string, string[]>> CriarRespostaModeloInvalido(
        ModelStateDictionary modelState)
    {
        var erros = modelState
            .Where(item => item.Value is { Errors.Count: > 0 })
            .ToDictionary(
                item => ConverterParaCamelCase(item.Key),
                item => item.Value!.Errors
                    .Select(erro => string.IsNullOrWhiteSpace(erro.ErrorMessage)
                        ? "O valor informado é inválido."
                        : erro.ErrorMessage)
                    .ToArray());

        return CriarRespostaModeloInvalido(erros);
    }

    public static RetroGamesResponseApiModel<Dictionary<string, string[]>> CriarRespostaModeloInvalido(
        Dictionary<string, string[]> erros)
    {
        return new RetroGamesResponseApiModel<Dictionary<string, string[]>>
        {
            ResponseCode = ResponseCodes.MODEL_STATE_INVALIDO,
            Data = erros,
            ErrorMessage = ResponseCodes.MENSAGEM_MODEL_STATE_INVALIDO,
        };
    }

    private static string ConverterParaCamelCase(string nome)
    {
        if (string.IsNullOrEmpty(nome) || nome == "$")
        {
            return nome;
        }

        return JsonNamingPolicy.CamelCase.ConvertName(nome);
    }
}
