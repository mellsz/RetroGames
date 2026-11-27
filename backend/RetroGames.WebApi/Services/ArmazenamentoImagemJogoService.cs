using Microsoft.AspNetCore.Http;
using RetroGames.Services;

namespace RetroGames.WebApi.Services;

public sealed class ArmazenamentoImagemJogoService : IArmazenamentoImagemJogoService
{
    private const long TamanhoMaximoEmBytes = 5 * 1024 * 1024;
    private static readonly HashSet<string> ExtensoesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];
    private readonly IWebHostEnvironment _ambiente;

    public ArmazenamentoImagemJogoService(IWebHostEnvironment ambiente)
    {
        _ambiente = ambiente ?? throw new ArgumentNullException(nameof(ambiente));
    }

    public async Task<string?> SalvarAsync(IFormFile? imagem, CancellationToken cancellationToken = default)
    {
        if (imagem is null || imagem.Length == 0)
        {
            return null;
        }

        var extensao = Path.GetExtension(imagem.FileName).ToLowerInvariant();
        if (!imagem.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) || !ExtensoesPermitidas.Contains(extensao))
        {
            throw new BusinessRuleException(BusinessErrors.IMAGEM_JOGO_INVALIDA);
        }

        if (imagem.Length > TamanhoMaximoEmBytes)
        {
            throw new BusinessRuleException(BusinessErrors.IMAGEM_JOGO_INVALIDA);
        }

        var raizWeb = string.IsNullOrWhiteSpace(_ambiente.WebRootPath)
            ? Path.Combine(_ambiente.ContentRootPath, "wwwroot")
            : _ambiente.WebRootPath;
        var diretorio = Path.Combine(raizWeb, "uploads", "jogos");
        Directory.CreateDirectory(diretorio);

        var nomeArquivo = $"{Guid.NewGuid():N}{extensao}";
        var caminhoArquivo = Path.Combine(diretorio, nomeArquivo);
        await using var destino = File.Create(caminhoArquivo);
        await imagem.CopyToAsync(destino, cancellationToken);

        return $"/uploads/jogos/{nomeArquivo}";
    }
}
