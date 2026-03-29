using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts
{
    public class AccountFilterRequest
    {
        [EmailAddress(ErrorMessage = "Email должен быть корректным.")]
        public string? Email { get; set; }
        public string? Surname { get; set; }
        public string? Name { get; set; }
        public string? Patronymic { get; set; }

    }
}
