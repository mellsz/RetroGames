namespace RetroGames.WebApi.ApiModels;

public class RetroGamesResponseApiModel<T> : RetroGamesResponseApiModel
{
    public T? Data { get; set; }
}
