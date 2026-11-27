using RetroGames.Model.Model;

namespace RetroGames.Repository;

public interface IMensagemContatoRepository
{
    Task<int> InserirAsync(MensagemContato mensagemContato);
}
