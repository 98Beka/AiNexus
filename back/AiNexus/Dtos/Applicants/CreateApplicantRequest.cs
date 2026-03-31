using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Applicants;

public class CreateApplicantRequest
{
    [Required]
    public string Name { get; set; }

    [Required]
    public string Surname { get; set; }

    public string? Patronymic { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Email должен быть корректным.")]
    public string Email { get; set; }

    public string? Phone { get; set; }
    [Required]
    public string Photo { get; set; }=string.Empty;
}
