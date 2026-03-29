using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress(ErrorMessage = "Email должен быть корректным.")]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
