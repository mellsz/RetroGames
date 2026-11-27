using Microsoft.AspNetCore.Http;

namespace RetroGames.WebApi.Services;

public interface IArmazenamentoImagemJogoService
{
    Task<string?> SalvarAsync(IFormFile? imagem, CancellationToken cancellationToken = default);
}
