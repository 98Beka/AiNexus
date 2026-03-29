namespace Library.Dtos.Accounts
{
    public class AccountDto
    {
        public string Id { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string? Patronymic { get; set; }
        public string Email { get; set; }
        public RoleDto Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsEnabled { get; set; }
    }
}
