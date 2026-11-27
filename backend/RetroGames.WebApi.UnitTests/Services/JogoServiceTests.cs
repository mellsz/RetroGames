using Moq;
using RetroGames.Model.Model;
using RetroGames.Repository;
using RetroGames.Services;

namespace RetroGames.WebApi.UnitTests.Services;

public sealed class JogoServiceTests
{
    private readonly Mock<IJogoRepository> _jogos = new();
    private readonly Mock<IPlataformaRepository> _plataformas = new();
    private readonly Mock<ICondicaoJogoRepository> _condicoes = new();
    private readonly Mock<IGeneroRepository> _generos = new();
    private readonly Mock<IJogoGeneroRepository> _vinculos = new();
    private readonly Mock<IRepositorySet> _repositorios = new();
    private readonly Mock<IUsuarioAtualService> _usuario = new();

    private JogoService CriarService()
    {
        _repositorios.SetupGet(r => r.Jogo).Returns(_jogos.Object);
        _repositorios.SetupGet(r => r.Plataforma).Returns(_plataformas.Object);
        _repositorios.SetupGet(r => r.CondicaoJogo).Returns(_condicoes.Object);
        _repositorios.SetupGet(r => r.Genero).Returns(_generos.Object);
        _repositorios.SetupGet(r => r.JogoGenero).Returns(_vinculos.Object);
        _condicoes.Setup(r => r.ListarAsync()).ReturnsAsync([new CondicaoJogo { Id = 2, Descricao = "Usado" }]);
        _plataformas.Setup(r => r.ListarAsync()).ReturnsAsync([]);
        _generos.Setup(r => r.ListarAsync()).ReturnsAsync([new Genero { Id = 3, Nome = "Aventura" }]);
        _vinculos.Setup(r => r.ListarPorJogosAsync(It.IsAny<IReadOnlyCollection<int>>())).ReturnsAsync([]);
        return new JogoService(_repositorios.Object, _usuario.Object);
    }

    private static Jogo JogoValido() => new() { Id = 7, Nome = "Zelda", IdPlataforma = 1, IdCondicaoJogo = 2, Ativo = true };

    [Fact]
    public async Task Inserir_PlataformaInexistente_NaoGrava()
    {
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().InserirAsync(JogoValido(), [3]));
        Assert.Equal(100, erro.Erro.Code);
        _jogos.Verify(r => r.InserirAsync(It.IsAny<Jogo>()), Times.Never);
    }

    [Fact]
    public async Task Inserir_CondicaoInexistente_NaoGrava()
    {
        _plataformas.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(new Plataforma { Id = 1 });
        var jogo = JogoValido(); jogo.IdCondicaoJogo = 99;
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().InserirAsync(jogo, [3]));
        Assert.Equal(104, erro.Erro.Code);
        _jogos.Verify(r => r.InserirAsync(It.IsAny<Jogo>()), Times.Never);
    }

    [Fact]
    public async Task Inserir_GeneroInexistente_NaoGrava()
    {
        _plataformas.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(new Plataforma { Id = 1 });
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().InserirAsync(JogoValido(), [99]));
        Assert.Equal(105, erro.Erro.Code);
        _jogos.Verify(r => r.InserirAsync(It.IsAny<Jogo>()), Times.Never);
    }

    [Fact]
    public async Task Listar_ComGenero_EnviaSomenteIdsVinculados()
    {
        _vinculos.Setup(r => r.ListarTodosAsync()).ReturnsAsync([new JogoGenero { IdJogo = 7, IdGenero = 3 }, new JogoGenero { IdJogo = 8, IdGenero = 4 }]);
        _jogos.Setup(r => r.ListarAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<IReadOnlyCollection<int>?>(), false, 1, 10)).ReturnsAsync((new List<Jogo>(), 0));
        await CriarService().ListarAsync(idGenero: 3);
        _jogos.Verify(r => r.ListarAsync(null, null, It.Is<IReadOnlyCollection<int>?>(ids => ids != null && ids.SequenceEqual(new[] { 7 })), false, 1, 10), Times.Once);
    }

    [Fact]
    public async Task Listar_SemGenero_NaoConsultaVinculos()
    {
        _jogos.Setup(r => r.ListarAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<IReadOnlyCollection<int>?>(), false, 1, 10)).ReturnsAsync((new List<Jogo>(), 0));
        await CriarService().ListarAsync();
        _vinculos.Verify(r => r.ListarTodosAsync(), Times.Never);
        _jogos.Verify(r => r.ListarAsync(null, null, null, false, 1, 10), Times.Once);
    }

    [Fact]
    public async Task Listar_ComJogos_MontaDetalhesComLinq()
    {
        var service = CriarService();
        _jogos.Setup(r => r.ListarAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<IReadOnlyCollection<int>?>(), false, 1, 10)).ReturnsAsync((new List<Jogo> { JogoValido() }, 1));
        _plataformas.Setup(r => r.ListarAsync()).ReturnsAsync([new Plataforma { Id = 1, Nome = "Nintendo" }]);
        var (itens, total) = await service.ListarAsync();
        Assert.Equal(1, total);
        Assert.Equal("Nintendo", Assert.Single(itens).NomePlataforma);
        Assert.Equal("Usado", itens[0].DescricaoCondicao);
    }

    [Fact]
    public async Task BuscarPorId_Inexistente_LancaNaoEncontrado()
    {
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().BuscarPorIdAsync(99));
        Assert.Equal(103, erro.Erro.Code);
    }

    [Fact]
    public async Task Desativar_Inexistente_NaoGrava()
    {
        var erro = await Assert.ThrowsAsync<BusinessRuleException>(() => CriarService().DesativarAsync(99));
        Assert.Equal(103, erro.Erro.Code);
        _jogos.Verify(r => r.AtualizarSituacaoAsync(It.IsAny<int>(), It.IsAny<bool>()), Times.Never);
    }
}
