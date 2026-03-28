namespace Library.Dtos.Accounts
{
    public class MyAccountInfo
    {
        public string Id { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string? Patronymic { get; set; }
        public string Pin { get; set; }
        public string Role { get; set; }
        public AccountSettingsDto Settings { get; set; }
    }
}
