using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Mappers;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class JogoController : ControllerBase
{
    private readonly IJogoService _service;

    public JogoController(IJogoService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<ActionResult<RetroGamesResponseApiModel<PaginaResponseApiModel<ListarJogoResponseApiModel>>>> Listar(
        [FromQuery] ListarJogoRequestApiModel request)
    {
        var filtro = request.ParaFiltro();
        var (jogos, totalEncontrado) = await _service.ListarAsync(
            filtro.Busca,
            filtro.IdPlataforma,
            filtro.IdGenero,
            filtro.Pagina,
            filtro.TamanhoPagina);

        var itens = jogos.Select(jogo => jogo.ParaListarResponse()).ToList();
        return Ok(new RetroGamesResponseApiModel<PaginaResponseApiModel<ListarJogoResponseApiModel>>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = new PaginaResponseApiModel<ListarJogoResponseApiModel>
            {
                Itens = itens,
                Pagina = filtro.Pagina,
                TamanhoPagina = filtro.TamanhoPagina,
                TotalItens = totalEncontrado,
                TotalPaginas = (int)Math.Ceiling((double)totalEncontrado / filtro.TamanhoPagina),
            },
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>>> ListarPorId(int id)
    {
        var jogo = await _service.BuscarPorIdAsync(id);

        return Ok(new RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = jogo.ParaListarPorIdResponse(),
        });
    }
}
