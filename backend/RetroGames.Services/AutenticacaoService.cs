using Microsoft.AspNetCore.Identity;
using RetroGames.Model.Constantes;
using RetroGames.Model.Model;
using RetroGames.Repository;

namespace RetroGames.Services;

public sealed class AutenticacaoService : IAutenticacaoService
{
    private readonly IRepositorySet _repositorio;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    public AutenticacaoService(
        IRepositorySet repositorio,
        IPasswordHasher<Usuario> passwordHasher)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
        _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
    }

    public async Task<Usuario?> AutenticarAsync(string email, string senha)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(senha))
        {
            return null;
        }

        var usuario = await _repositorio.Usuario.BuscarPorEmailAsync(email.Trim());
        if (usuario is null || !usuario.Ativo)
        {
            return null;
        }

        var resultado = _passwordHasher.VerifyHashedPassword(usuario, usuario.SenhaHash, senha);
        return resultado is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded
            ? usuario
            : null;
    }

    public async Task<Usuario> CadastrarClienteAsync(string nome, string email, string senha)
    {
        var emailNormalizado = email.Trim().ToLowerInvariant();
        if (await _repositorio.Usuario.BuscarPorEmailAsync(emailNormalizado) is not null)
        {
            throw new BusinessRuleException(BusinessErrors.USUARIO_EMAIL_DUPLICADO);
        }

        var cliente = new Usuario
        {
            Nome = nome.Trim(),
            Email = emailNormalizado,
            Ativo = true,
            DataCadastro = DateTime.UtcNow,
            IdPerfil = PerfilIds.Cliente,
        };
        cliente.SenhaHash = _passwordHasher.HashPassword(cliente, senha);

        try
        {
            cliente.Id = await _repositorio.Usuario.InserirAsync(cliente);
            return cliente;
        }
        catch (RegistroDuplicadoException)
        {
            throw new BusinessRuleException(BusinessErrors.USUARIO_EMAIL_DUPLICADO);
        }
    }

    public async Task GarantirAdministradorInicialAsync(string email, string senha)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(senha);

        if (await _repositorio.Usuario.ExisteAdministradorAsync())
        {
            return;
        }

        var administrador = new Usuario
        {
            Nome = "Administrador",
            Email = email.Trim(),
            Ativo = true,
            DataCadastro = DateTime.UtcNow,
            IdPerfil = PerfilIds.Administrador,
        };
        administrador.SenhaHash = _passwordHasher.HashPassword(administrador, senha);

        administrador.Id = await _repositorio.Usuario.InserirAsync(administrador);
    }
}
