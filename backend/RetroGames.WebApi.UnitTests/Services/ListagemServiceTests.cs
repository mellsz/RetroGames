using Moq;
using RetroGames.Model.Model;
using RetroGames.Repository;
using RetroGames.Services;

namespace RetroGames.WebApi.UnitTests.Services;

public sealed class GeneroServiceTests
{
    [Fact]
    public async Task Listar_RetornaGenerosDoRepository()
    {
        var generos = new List<Genero> { new() { Id = 1, Nome = "Ação" } };
        var repository = new Mock<IGeneroRepository>();
        var conjunto = new Mock<IRepositorySet>();
        repository.Setup(r => r.ListarAsync()).ReturnsAsync(generos);
        conjunto.SetupGet(r => r.Genero).Returns(repository.Object);
        Assert.Same(generos, await new GeneroService(conjunto.Object).ListarAsync());
        repository.Verify(r => r.ListarAsync(), Times.Once);
    }
}

public sealed class CondicaoJogoServiceTests
{
    [Fact]
    public async Task Listar_RetornaCondicoesDoRepository()
    {
        var condicoes = new List<CondicaoJogo> { new() { Id = 1, Descricao = "Usado" } };
        var repository = new Mock<ICondicaoJogoRepository>();
        var conjunto = new Mock<IRepositorySet>();
        repository.Setup(r => r.ListarAsync()).ReturnsAsync(condicoes);
        conjunto.SetupGet(r => r.CondicaoJogo).Returns(repository.Object);
        Assert.Same(condicoes, await new CondicaoJogoService(conjunto.Object).ListarAsync());
        repository.Verify(r => r.ListarAsync(), Times.Once);
    }
}
