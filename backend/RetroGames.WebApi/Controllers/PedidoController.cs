using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Configuration;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PedidoController(IPedidoService service) : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = Politicas.Cliente)]
    public async Task<ActionResult<RetroGamesResponseApiModel<PedidoResponseApiModel>>> Criar(
        [FromBody] CriarPedidoRequestApiModel? request)
    {
        if (request?.Itens is null || request.Itens.Any(item => item is null))
            throw new BusinessRuleException(BusinessErrors.PEDIDO_INVALIDO);

        var pedido = await service.CriarAsync(request.Itens.Select(item => new ItemCompra(item.IdJogo, item.Quantidade)).ToArray());
        return CreatedAtAction(nameof(BuscarPorId), new { id = pedido.Pedido.Id }, new RetroGamesResponseApiModel<PedidoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = Mapear(pedido),
        });
    }

    [HttpGet("meus")]
    [Authorize(Policy = Politicas.Cliente)]
    public async Task<ActionResult<RetroGamesResponseApiModel<List<PedidoResponseApiModel>>>> Meus()
        => Ok(new RetroGamesResponseApiModel<List<PedidoResponseApiModel>>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = (await service.MeusAsync()).Select(Mapear).ToList(),
        });

    [HttpPost("{id:int}/cancelar")]
    [Authorize(Policy = Politicas.Cliente)]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Cancelar(int id)
    {
        await service.CancelarAsync(id);
        return Ok(new RetroGamesResponseApiModel { ResponseCode = ResponseCodes.SUCESSO });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RetroGamesResponseApiModel<PedidoResponseApiModel>>> BuscarPorId(int id)
        => Ok(new RetroGamesResponseApiModel<PedidoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = Mapear(await service.BuscarPorIdAsync(id)),
        });

    [HttpGet]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel<List<PedidoResponseApiModel>>>> Listar([FromQuery] int? idSituacao)
        => Ok(new RetroGamesResponseApiModel<List<PedidoResponseApiModel>>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = (await service.ListarAdministracaoAsync(idSituacao)).Select(Mapear).ToList(),
        });

    [HttpPut("{id:int}/situacao")]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel>> AlterarSituacao(int id, [FromBody] AlterarSituacaoPedidoRequestApiModel request)
    {
        await service.AlterarSituacaoAsync(id, request.IdSituacao);
        return Ok(new RetroGamesResponseApiModel { ResponseCode = ResponseCodes.SUCESSO });
    }

    private static PedidoResponseApiModel Mapear(PedidoDetalhe detalhe) => new()
    {
        Id = detalhe.Pedido.Id,
        DataPedido = detalhe.Pedido.DataPedido,
        Total = detalhe.Pedido.Total,
        IdUsuario = detalhe.Pedido.IdUsuario,
        NomeCliente = detalhe.NomeCliente,
        IdSituacao = detalhe.Pedido.IdSituacao,
        Situacao = detalhe.Situacao,
        Itens = detalhe.Itens.Select(par => new ItemPedidoResponseApiModel
        {
            IdJogo = par.Item.IdJogo,
            NomeJogo = par.NomeJogo,
            Quantidade = par.Item.Quantidade,
            ValorUnitario = par.Item.ValorUnitario,
            Subtotal = par.Item.ValorUnitario * par.Item.Quantidade,
        }).ToList(),
    };
}
