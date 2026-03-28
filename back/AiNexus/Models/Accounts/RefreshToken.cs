namespace Library.Models.Accounts;

public class RefreshToken
{
    public int Id { get; set; }
    public string AccountId { get; set; }
    public Account Account { get; set; }
    public string Token { get; set; }
    public DateTime Expires { get; set; }
    public DateTime Created { get; set; }
    public bool IsExpired => DateTime.Now >= Expires;
}
