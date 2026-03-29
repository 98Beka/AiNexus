using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts
{
    public class ChangePasswordRequest
    {
        [Required]
        [EmailAddress(ErrorMessage = "Email должен быть корректным.")]
        public string Email { get; set; }

        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W|_).{6,}$",
            ErrorMessage = "Пароль должен соответствовать требованиям безопасности.")]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; }
    }
}
