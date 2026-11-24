using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using DotNetEnv;
using RetroGames.WebApi.Configuration;
using RetroGames.WebApi.ActionFilters;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Middlewares;
using RetroGames.WebApi.Services;

Env.TraversePath().Load();

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
    ?? throw new InvalidOperationException(
        "A configuração ConnectionStrings__Default não foi encontrada no arquivo .env.");
var adminInicialEmail = Environment.GetEnvironmentVariable("AdminInicial__Email")
    ?? throw new InvalidOperationException(
        "A configuração AdminInicial__Email não foi encontrada no arquivo .env.");
var adminInicialSenha = Environment.GetEnvironmentVariable("AdminInicial__Senha")
    ?? throw new InvalidOperationException(
        "A configuração AdminInicial__Senha não foi encontrada no arquivo .env.");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRepositorios(connectionString);
builder.Services.AddServicosDeNegocio();
builder.Services.AddAutenticacao();
builder.Services.AddAutorizacao();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<RetroGames.Services.IUsuarioAtualService, UsuarioAtualService>();
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

using (var scope = app.Services.CreateScope())
{
    var autenticacaoService = scope.ServiceProvider.GetRequiredService<RetroGames.Services.IAutenticacaoService>();
    await autenticacaoService.GarantirAdministradorInicialAsync(adminInicialEmail, adminInicialSenha);
}

app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "RetroGames API v1");
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
