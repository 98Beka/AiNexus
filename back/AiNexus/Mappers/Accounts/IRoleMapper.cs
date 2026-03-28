using Library.Models.Accounts;

namespace Library.Mappers.Accounts
{
    public interface IRoleMapper
    {
        string ToRole(Account account);

        List<string> ToRoles(Account account);
    }
}
