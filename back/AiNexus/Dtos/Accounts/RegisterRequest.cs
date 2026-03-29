using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts
{
    public class RegisterRequest
    {
        [Required]
        public string Surname { get; set; }

        [Required]
        public string Name { get; set; }

        public string? Patronymic { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Email должен быть корректным.")]
        public string Email { get; set; }

        [Required]
        public string RoleId { get; set; }

        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W|_).{6,}$",
            ErrorMessage = "Пароль должен соответствовать требованиям безопасности.")]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }
    }
}
