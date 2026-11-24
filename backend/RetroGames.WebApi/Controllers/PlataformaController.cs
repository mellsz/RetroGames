using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Mappers;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PlataformaController : ControllerBase
{
    private readonly IPlataformaService _service;

    public PlataformaController(IPlataformaService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<ActionResult<RetroGamesResponseApiModel<List<ListarPlataformaResponseApiModel>>>> Listar()
    {
        var plataformas = await _service.ListarAsync();

        return Ok(new RetroGamesResponseApiModel<List<ListarPlataformaResponseApiModel>>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = plataformas.Select(plataforma => plataforma.ParaResponse()).ToList(),
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPlataformaResponseApiModel>>> ListarPorId(int id)
    {
        var plataforma = await _service.BuscarPorIdAsync(id);

        return Ok(new RetroGamesResponseApiModel<ListarPlataformaResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = plataforma.ParaResponse(),
        });
    }

    [HttpPost]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPlataformaResponseApiModel>>> Inserir(
        [FromBody] InserirPlataformaRequestApiModel? request)
    {
        var plataforma = await _service.InserirAsync(request!.ParaModel());
        var resposta = new RetroGamesResponseApiModel<ListarPlataformaResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = plataforma.ParaResponse(),
        };

        return CreatedAtAction(nameof(ListarPorId), new { id = plataforma.Id }, resposta);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPlataformaResponseApiModel>>> Alterar(
        int id,
        [FromBody] AlterarPlataformaRequestApiModel? request)
    {
        var plataforma = request!.ParaModel(id);
        await _service.AlterarAsync(plataforma);

        return Ok(new RetroGamesResponseApiModel<ListarPlataformaResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = plataforma.ParaResponse(),
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Excluir(int id)
    {
        await _service.ExcluirAsync(id);

        return Ok(new RetroGamesResponseApiModel
        {
            ResponseCode = ResponseCodes.SUCESSO,
        });
    }
}
