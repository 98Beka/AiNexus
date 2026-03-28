namespace Library.Models.Accounts;

public class Session
{
    public long Id { get; set; }
    public string IpAddress { get; set; }
    public string Browser { get; set; }
    public DateTime LoggedInAt { get; set; } = DateTime.Now;
    public DateTime? LoggedOutAt { get; set; }
    public string AccountId { get; set; }
    public Account Account { get; set; }
}
