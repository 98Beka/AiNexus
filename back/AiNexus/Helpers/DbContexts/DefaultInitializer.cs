using Library.Helpers.Constants.Accounts;
using Library.Models.Accounts;
using Microsoft.AspNetCore.Identity;

namespace Library.Helpers.DbContexts;

public class DefaultInitializer
{
    public static async Task InitializeAsync(DefaultAdminCridensial defaultAdminCridensial, UserManager<Account> userManager, RoleManager<Role> roleManager, AppPostgreSQLDbContext context)
    {
        if (await roleManager.FindByNameAsync(Enums.Accounts.Role.admin.ToString()) == null)
        {
            await roleManager.CreateAsync(new Role { Name = Enums.Accounts.Role.admin.ToString(), Description = "Администратор" });
        }
        if (await roleManager.FindByNameAsync(Enums.Accounts.Role.moderator.ToString()) == null)
        {
            await roleManager.CreateAsync(new Role { Name = Enums.Accounts.Role.moderator.ToString(), Description = "Модератор" });
        }
        if (await roleManager.FindByNameAsync(Enums.Accounts.Role.reader.ToString()) == null)
        {
            await roleManager.CreateAsync(new Role { Name = Enums.Accounts.Role.reader.ToString(), Description = "Пользователь" });
        }
        if (await userManager.FindByNameAsync(defaultAdminCridensial.Login) == null)
        {
            Account admin = new Account
            {
                Email = defaultAdminCridensial.Login,
                UserName = defaultAdminCridensial.Login,
                Surname = "Default",
                Name = "Administrator",
            };
            IdentityResult result = await userManager.CreateAsync(admin, defaultAdminCridensial.Password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, Enums.Accounts.Role.admin.ToString());
            }
        }
    }
}