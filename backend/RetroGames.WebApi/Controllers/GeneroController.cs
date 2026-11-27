using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Configuration;
using RetroGames.WebApi.Mappers;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class GeneroController : ControllerBase
{
    private readonly IGeneroService _service;

    public GeneroController(IGeneroService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<RetroGamesResponseApiModel<List<ListarGeneroResponseApiModel>>>> Listar()
    {
        var generos = await _service.ListarAsync();

        return Ok(new RetroGamesResponseApiModel<List<ListarGeneroResponseApiModel>>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = generos.Select(genero => genero.ParaResponse()).ToList(),
        });
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarGeneroResponseApiModel>>> BuscarPorId(int id)
        => Ok(new RetroGamesResponseApiModel<ListarGeneroResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = (await _service.BuscarPorIdAsync(id)).ParaResponse(),
        });

    [HttpPost]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarGeneroResponseApiModel>>> Inserir([FromBody] SalvarGeneroRequestApiModel request)
    {
        var genero = await _service.InserirAsync(new RetroGames.Model.Model.Genero { Nome = request.Nome });
        return CreatedAtAction(nameof(BuscarPorId), new { id = genero.Id }, new RetroGamesResponseApiModel<ListarGeneroResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = genero.ParaResponse(),
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarGeneroResponseApiModel>>> Alterar(int id, [FromBody] SalvarGeneroRequestApiModel request)
    {
        var genero = new RetroGames.Model.Model.Genero { Id = id, Nome = request.Nome };
        await _service.AlterarAsync(genero);
        return Ok(new RetroGamesResponseApiModel<ListarGeneroResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = genero.ParaResponse(),
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Excluir(int id)
    {
        await _service.ExcluirAsync(id);
        return Ok(new RetroGamesResponseApiModel { ResponseCode = ResponseCodes.SUCESSO });
    }
}
