using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts
{
    public class ChangePasswordRequest
    {
        [Required]
        [StringLength(14, MinimumLength = 14, ErrorMessage = "Pin должен содержать ровно 14 символов.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Pin должен состоять только из цифр.")]
        public string Pin { get; set; }

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
