namespace RetroGames.WebApi.ApiModels;

public class PaginaResponseApiModel<T>
{
    public List<T> Itens { get; set; } = [];

    public int Pagina { get; set; }

    public int TamanhoPagina { get; set; }

    public int TotalItens { get; set; }

    public int TotalPaginas { get; set; }
}
