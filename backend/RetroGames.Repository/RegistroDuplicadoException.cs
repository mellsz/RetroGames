namespace RetroGames.Repository;

public sealed class RegistroDuplicadoException : Exception
{
    public RegistroDuplicadoException(Exception innerException)
        : base("O registro viola uma restrição de unicidade.", innerException)
    {
    }
}
