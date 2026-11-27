using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class MensagemContatoService : IMensagemContatoService
{
    private readonly IRepositorySet _repositorio;
    private readonly IUsuarioAtualService _usuarioAtual;

    public MensagemContatoService(IRepositorySet repositorio, IUsuarioAtualService usuarioAtual)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
        _usuarioAtual = usuarioAtual ?? throw new ArgumentNullException(nameof(usuarioAtual));
    }

    public async Task EnviarAsync(string mensagem)
    {
        var idUsuario = _usuarioAtual.IdUsuario;
        if (!_usuarioAtual.EstaLogado || !idUsuario.HasValue)
        {
            throw new BusinessRuleException(BusinessErrors.USUARIO_NAO_AUTENTICADO);
        }

        var mensagemContato = new MensagemContato
        {
            Mensagem = mensagem.Trim(),
            DataEnvio = DateTime.UtcNow,
            IdUsuario = idUsuario.Value,
        };

        mensagemContato.Id = await _repositorio.MensagemContato.InserirAsync(mensagemContato);
    }
}
