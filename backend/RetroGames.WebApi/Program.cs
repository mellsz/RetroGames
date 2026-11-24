using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using DotNetEnv;
using RetroGames.WebApi.Configuration;
using RetroGames.WebApi.ActionFilters;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Middlewares;

Env.TraversePath().Load();

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
    ?? throw new InvalidOperationException(
        "A configuração ConnectionStrings__Default não foi encontrada no arquivo .env.");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRepositorios(connectionString);
builder.Services.AddServicosDeNegocio();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddControllers(options => options.Filters.Add<FluentValidationFilter>());
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(
        FluentValidationFilter.CriarRespostaModeloInvalido(context.ModelState));
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
