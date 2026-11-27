using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetroGames.Services;
using RetroGames.WebApi.ApiModels;
using RetroGames.WebApi.Extensions;
using RetroGames.WebApi.Mappers;

namespace RetroGames.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AutenticacaoController : ControllerBase
{
    private readonly IAutenticacaoService _service;

    public AutenticacaoController(IAutenticacaoService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<RetroGamesResponseApiModel<UsuarioLogadoResponseApiModel>>> Login(
        [FromBody] LoginRequestApiModel? request)
    {
        var requestRecebido = request!;
        var usuario = await _service.AutenticarAsync(requestRecebido.Email, requestRecebido.Senha);
        if (usuario is null)
        {
            return Unauthorized(new RetroGamesResponseApiModel
            {
                ResponseCode = ResponseCodes.CREDENCIAIS_INVALIDAS,
                ErrorMessage = ResponseCodes.MENSAGEM_CREDENCIAIS_INVALIDAS,
            });
        }

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            usuario.ParaClaimsPrincipal());

        return Ok(new RetroGamesResponseApiModel<UsuarioLogadoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = usuario.ParaResponse(),
        });
    }

    [AllowAnonymous]
    [HttpPost("cadastrar")]
    public async Task<ActionResult<RetroGamesResponseApiModel<UsuarioLogadoResponseApiModel>>> Cadastrar(
        [FromBody] CadastrarUsuarioRequestApiModel? request)
    {
        var requestRecebido = request!;
        var usuario = await _service.CadastrarClienteAsync(
            requestRecebido.Nome,
            requestRecebido.Email,
            requestRecebido.Senha);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            usuario.ParaClaimsPrincipal());

        return StatusCode(StatusCodes.Status201Created, new RetroGamesResponseApiModel<UsuarioLogadoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = usuario.ParaResponse(),
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult<RetroGamesResponseApiModel>> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return Ok(new RetroGamesResponseApiModel
        {
            ResponseCode = ResponseCodes.SUCESSO,
        });
    }

    [Authorize]
    [HttpGet("eu")]
    public ActionResult<RetroGamesResponseApiModel<UsuarioLogadoResponseApiModel>> Eu()
    {
        return Ok(new RetroGamesResponseApiModel<UsuarioLogadoResponseApiModel>
        {
            ResponseCode = ResponseCodes.SUCESSO,
            Data = new UsuarioLogadoResponseApiModel
            {
                Id = User.ObterIdUsuario() ?? 0,
                Nome = User.Identity?.Name ?? string.Empty,
                Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? string.Empty,
                Perfil = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? string.Empty,
            },
        });
    }
}
