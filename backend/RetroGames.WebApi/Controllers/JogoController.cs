using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Configuration;
using RetroGames.WebApi.Mappers;
using RetroGames.WebApi.Services;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class JogoController : ControllerBase
{
    private readonly IJogoService _service;
    private readonly IUsuarioAtualService _usuarioAtual;
    private readonly IArmazenamentoImagemJogoService _armazenamentoImagem;

    public JogoController(
        IJogoService service,
        IUsuarioAtualService usuarioAtual,
        IArmazenamentoImagemJogoService armazenamentoImagem)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
        _usuarioAtual = usuarioAtual ?? throw new ArgumentNullException(nameof(usuarioAtual));
        _armazenamentoImagem = armazenamentoImagem ?? throw new ArgumentNullException(nameof(armazenamentoImagem));
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<RetroGamesResponseApiModel<PaginaResponseApiModel<ListarJogoResponseApiModel>>>> Listar(
        [FromQuery] ListarJogoRequestApiModel request)
    {
        var filtro = request.ParaFiltro();
        var (jogos, totalEncontrado) = await _service.ListarAsync(
            filtro.Busca,
            filtro.IdPlataforma,
            filtro.IdGenero,
            filtro.IncluirInativos && _usuarioAtual.EhAdministrador,
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
    [AllowAnonymous]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>>> ListarPorId(int id)
    {
        var jogo = await _service.BuscarPorIdAsync(id);
        if (!jogo.Jogo.Ativo && !_usuarioAtual.EhAdministrador)
        {
            throw new BusinessRuleException(BusinessErrors.JOGO_NAO_ENCONTRADO);
        }

        return Ok(new RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = jogo.ParaListarPorIdResponse(),
        });
    }

    [HttpPost]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>>> Inserir(
        [FromForm] InserirJogoRequestApiModel? request)
    {
        var requestRecebido = request!;
        var jogoParaInserir = requestRecebido.ParaModel();
        jogoParaInserir.Imagem = await _armazenamentoImagem.SalvarAsync(requestRecebido.Imagem, HttpContext.RequestAborted);
        var jogo = await _service.InserirAsync(jogoParaInserir, requestRecebido.IdsGeneros);
        var detalhe = await _service.BuscarPorIdAsync(jogo.Id);
        var resposta = new RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = detalhe.ParaListarPorIdResponse(),
        };

        return CreatedAtAction(nameof(ListarPorId), new { id = jogo.Id }, resposta);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>>> Alterar(
        int id,
        [FromForm] AlterarJogoRequestApiModel? request)
    {
        var requestRecebido = request!;
        var jogoAtual = await _service.BuscarPorIdAsync(id);
        var jogoParaAlterar = requestRecebido.ParaModel(id);
        jogoParaAlterar.Imagem = await _armazenamentoImagem.SalvarAsync(requestRecebido.Imagem, HttpContext.RequestAborted)
            ?? jogoAtual.Jogo.Imagem;
        await _service.AlterarAsync(jogoParaAlterar, requestRecebido.IdsGeneros);
        var detalhe = await _service.BuscarPorIdAsync(id);

        return Ok(new RetroGamesResponseApiModel<ListarPorIdJogoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = detalhe.ParaListarPorIdResponse(),
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Desativar(int id)
    {
        await _service.DesativarAsync(id);

        return Ok(new RetroGamesResponseApiModel
        {
            ResponseCode = ResponseCodes.SUCESSO,
        });
    }

    [HttpPatch("{id:int}/ativar")]
    [Authorize(Policy = Politicas.Administrador)]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Ativar(int id)
    {
        await _service.AtivarAsync(id);

        return Ok(new RetroGamesResponseApiModel
        {
            ResponseCode = ResponseCodes.SUCESSO,
        });
    }
}
