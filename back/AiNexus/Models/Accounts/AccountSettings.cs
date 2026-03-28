namespace Library.Models.Accounts;

public class AccountSettings
{
    public long Id { get; set; }
    public string Language { get; set; } = Enums.Accounts.Language.ru.ToString();
    public string Theme { get; set; } = Enums.Accounts.Theme.light.ToString();
    public string AccountId { get; set; }
    public Account Account { get; set; }
}
