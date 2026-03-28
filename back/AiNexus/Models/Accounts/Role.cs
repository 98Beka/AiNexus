
using Microsoft.AspNetCore.Identity;

namespace Library.Models.Accounts
{
    public class Role : IdentityRole
    {
        public string? Description { get; set; }
    }
}