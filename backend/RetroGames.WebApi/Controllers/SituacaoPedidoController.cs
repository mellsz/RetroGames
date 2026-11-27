using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Configuration;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Politicas.Administrador)]
public sealed class SituacaoPedidoController(IPedidoService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<RetroGamesResponseApiModel<List<SituacaoPedidoResponseApiModel>>>> Listar()
        => Ok(new RetroGamesResponseApiModel<List<SituacaoPedidoResponseApiModel>>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = (await service.ListarSituacoesAsync())
                .Select(situacao => new SituacaoPedidoResponseApiModel { Id = situacao.Id, Descricao = situacao.Descricao })
                .ToList(),
        });
}
