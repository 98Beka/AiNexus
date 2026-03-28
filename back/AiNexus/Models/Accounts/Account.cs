using Microsoft.AspNetCore.Identity;

namespace Library.Models.Accounts;

public class Account : IdentityUser
{
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronymic { get; set; }
    public List<RefreshToken> RefreshTokens { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    public bool IsEnabled { get; set; } = true;
    public DateTime LastPasswordChangeDate { get; set; } = DateTime.Now;
    public AccountSettings Settings { get; set; } = new();
    public ICollection<Session> Sessions { get; set; }
    public string Fullname
    {
        get
        {
            return $"{Surname} {Name}{(string.IsNullOrEmpty(Patronymic) ? "" : " " + Patronymic)}";
        }
        set { }
    }
}
