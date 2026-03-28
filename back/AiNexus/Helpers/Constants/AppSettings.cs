namespace Library.Helpers.Constants
{
    public class AppSettings
    {
        public string Secret { get; set; }
        public int JwtTokenTTL { get; set; }
        public int RefreshTokenTTL { get; set; }
    }
}
