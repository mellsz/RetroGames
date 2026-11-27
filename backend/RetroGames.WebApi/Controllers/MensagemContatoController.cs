using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MensagemContatoController : ControllerBase
{
    private readonly IMensagemContatoService _service;

    public MensagemContatoController(IMensagemContatoService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Enviar(
        [FromBody] EnviarMensagemContatoRequestApiModel? request)
    {
        await _service.EnviarAsync(request!.Mensagem);

        return StatusCode(StatusCodes.Status201Created, new RetroGamesResponseApiModel
        {
            ResponseCode = ResponseCodes.SUCESSO,
        });
    }
}
