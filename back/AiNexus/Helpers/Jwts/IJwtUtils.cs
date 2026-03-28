using Library.Models.Accounts;

namespace Library.Helpers.Jwts
{
    public interface IJwtUtils
    {
        string GenerateJwtToken(Account account);

        string GenerateFileJwtToken(long moduleId);

        (string?, List<string>?, string?) ValidateJwtToken(string token);

        long? ValidateFileJwtToken(string token);
    }
}
