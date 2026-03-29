namespace Library.Dtos.Accounts
{
    public class AuthenticateResponse
    {
        public string Id { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string? Patronymic { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public AccountSettingsDto Settings { get; set; }
    }
}