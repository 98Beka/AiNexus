namespace Library.Helpers.Constants;

public class AppSettings
{
    public string Secret { get; set; }
    public int JwtTokenTTL { get; set; }
    public int TestTokenTTL { get; set; }
    public int RefreshTokenTTL { get; set; }
    public string BaseUrl { get; set; }
}
