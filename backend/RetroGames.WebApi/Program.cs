using DotNetEnv;
using RetroGames.WebApi.Configuration;

Env.TraversePath().Load();

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
    ?? throw new InvalidOperationException(
        "A configuração ConnectionStrings__Default não foi encontrada no arquivo .env.");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRepositorios(connectionString);
builder.Services.AddServicosDeNegocio();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

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
