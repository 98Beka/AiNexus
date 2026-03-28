using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts
{
    public class LoginRequest
    {
        [Required]
        [StringLength(14, MinimumLength = 14, ErrorMessage = "Pin должен содержать ровно 14 символов.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Pin должен состоять только из цифр.")]
        public string Pin { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
