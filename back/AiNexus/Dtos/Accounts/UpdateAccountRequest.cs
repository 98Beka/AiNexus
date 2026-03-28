using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Accounts;

public class UpdateAccountRequest
{
    [Required]
    public string Id { get; set; }
    [Required]
    public string Surname { get; set; }

    [Required]
    public string Name { get; set; }

    public string? Patronymic { get; set; }

    [Required]
    public string RoleId { get; set; }
}
