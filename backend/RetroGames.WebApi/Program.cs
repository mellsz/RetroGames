using DotNetEnv;
using Microsoft.AspNetCore.Mvc;
using RetroGames.WebApi.Configuration;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Middlewares;

Env.TraversePath().Load();

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
    ?? throw new InvalidOperationException(
        "A configuração ConnectionStrings__Default não foi encontrada no arquivo .env.");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRepositorios(connectionString);
builder.Services.AddServicosDeNegocio();
builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = _ => new BadRequestObjectResult(
            new RetroGamesResponseApiModel
            {
                ResponseCode = ResponseCodes.PARAMETROS_INVALIDOS,
                ErrorMessage = "Os parâmetros informados são inválidos.",
            });
    });
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "RetroGames API v1");
    });
}

app.MapControllers();

app.Run();
