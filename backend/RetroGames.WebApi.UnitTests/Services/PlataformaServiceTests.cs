using Moq;
using RetroGames.Model.Model;
using RetroGames.Repository;
using RetroGames.Services;

namespace RetroGames.WebApi.UnitTests.Services;

public sealed class PlataformaServiceTests
{
    private readonly Mock<IPlataformaRepository> _plataformas = new();
    private readonly Mock<IRepositorySet> _repositorios = new();

    private PlataformaService CriarService()
    {
        _repositorios.SetupGet(r => r.Plataforma).Returns(_plataformas.Object);
        return new PlataformaService(_repositorios.Object);
    }

    [Fact]
    public async Task BuscarPorId_IdInexistente_LancaNaoEncontrada()
    {
        _plataformas.Setup(r => r.BuscarPorIdAsync(9)).ReturnsAsync((Plataforma?)null);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().BuscarPorIdAsync(9));
        Assert.Equal(BusinessErrors.PLATAFORMA_NAO_ENCONTRADA.Code, erro.Erro.Code);
    }

    [Fact]
    public async Task Inserir_NomeDuplicado_NaoGrava()
    {
        _plataformas.Setup(r => r.ExisteComNomeAsync("Nintendo", null)).ReturnsAsync(true);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().InserirAsync(new Plataforma { Nome = " Nintendo " }));
        Assert.Equal(BusinessErrors.PLATAFORMA_NOME_DUPLICADO.Code, erro.Erro.Code);
        _plataformas.Verify(r => r.InserirAsync(It.IsAny<Plataforma>()), Times.Never);
    }

    [Fact]
    public async Task Inserir_RepositoryDetectaDuplicidade_ConverteErro()
    {
        _plataformas.Setup(r => r.InserirAsync(It.IsAny<Plataforma>())).ThrowsAsync(new RegistroDuplicadoException(null!));
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().InserirAsync(new Plataforma { Nome = "Nintendo" }));
        Assert.Equal(BusinessErrors.PLATAFORMA_NOME_DUPLICADO.Code, erro.Erro.Code);
    }

    [Fact]
    public async Task Inserir_NomeLivre_DevolveIdGerado()
    {
        _plataformas.Setup(r => r.InserirAsync(It.IsAny<Plataforma>())).ReturnsAsync(42);
        var plataforma = await CriarService().InserirAsync(new Plataforma { Nome = " Nintendo " });
        Assert.Equal(42, plataforma.Id);
        Assert.Equal("Nintendo", plataforma.Nome);
        _plataformas.Verify(r => r.InserirAsync(It.IsAny<Plataforma>()), Times.Once);
    }

    [Fact]
    public async Task Alterar_MantendoProprioNome_Grava()
    {
        var plataforma = new Plataforma { Id = 3, Nome = "Nintendo" };
        _plataformas.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(plataforma);
        await CriarService().AlterarAsync(plataforma);
        _plataformas.Verify(r => r.ExisteComNomeAsync("Nintendo", 3), Times.Once);
        _plataformas.Verify(r => r.AlterarAsync(plataforma), Times.Once);
    }

    [Fact]
    public async Task Excluir_ComJogos_NaoExclui()
    {
        _plataformas.Setup(r => r.BuscarPorIdAsync(3)).ReturnsAsync(new Plataforma { Id = 3 });
        _plataformas.Setup(r => r.PossuiJogosAsync(3)).ReturnsAsync(true);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().ExcluirAsync(3));
        Assert.Equal(BusinessErrors.PLATAFORMA_POSSUI_JOGOS.Code, erro.Erro.Code);
        _plataformas.Verify(r => r.ExcluirAsync(It.IsAny<int>()), Times.Never);
    }
}
