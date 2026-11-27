using Moq;
using RetroGames.Model.Model;
using RetroGames.Repository;
using RetroGames.Services;

namespace RetroGames.WebApi.UnitTests.Services;

public sealed class GeneroAdministracaoServiceTests
{
    private readonly Mock<IRepositorySet> _repositorios = new();
    private readonly Mock<IGeneroRepository> _generos = new();
    private readonly Mock<IJogoGeneroRepository> _vinculos = new();

    private GeneroService CriarService()
    {
        _repositorios.SetupGet(r => r.Genero).Returns(_generos.Object);
        _repositorios.SetupGet(r => r.JogoGenero).Returns(_vinculos.Object);
        return new GeneroService(_repositorios.Object);
    }

    [Fact]
    public async Task Inserir_Duplicado_NaoGrava()
    {
        _generos.Setup(r => r.ExisteComNomeAsync("Ação", null)).ReturnsAsync(true);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().InserirAsync(new Genero { Nome = " Ação " }));
        Assert.Equal(107, erro.Erro.Code);
        _generos.Verify(r => r.InserirAsync(It.IsAny<Genero>()), Times.Never);
    }

    [Fact]
    public async Task Inserir_Valido_DevolveId()
    {
        _generos.Setup(r => r.InserirAsync(It.IsAny<Genero>())).ReturnsAsync(9);
        var genero = await CriarService().InserirAsync(new Genero { Nome = " Ação " });
        Assert.Equal(9, genero.Id);
        Assert.Equal("Ação", genero.Nome);
    }

    [Fact]
    public async Task Excluir_ComJogos_NaoExclui()
    {
        _generos.Setup(r => r.BuscarPorIdAsync(9)).ReturnsAsync(new Genero { Id = 9, Nome = "Ação" });
        _vinculos.Setup(r => r.PossuiJogosDoGeneroAsync(9)).ReturnsAsync(true);
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().ExcluirAsync(9));
        Assert.Equal(108, erro.Erro.Code);
        _generos.Verify(r => r.ExcluirAsync(It.IsAny<int>()), Times.Never);
    }
}
