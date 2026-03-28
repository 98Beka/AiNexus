using Library.Models.Accounts;
using Microsoft.AspNetCore.Identity;

namespace Library.Mappers.Accounts.Impl
{
    public class DefaultRoleMapper(UserManager<Account> userManager) : IRoleMapper
    {
        public string ToRole(Account account)
        {
            var accountRoles = userManager.GetRolesAsync(account).Result;

            return accountRoles.Last();
        }

        public List<string> ToRoles(Account account)
        {
            var accountRoles = userManager.GetRolesAsync(account).Result;

            return accountRoles.ToList();
        }
    }
}
