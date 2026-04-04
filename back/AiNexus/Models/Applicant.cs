namespace Library.Models;

public class Applicant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; }
    public string Surname { get; set; }
    public string? Patronymic { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; } = "Submitted";
    public string TemporaryToken { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime TemporaryTokenExpiresAt { get; set; } = DateTime.UtcNow.AddDays(3);
    public string Preview { get; set; } = string.Empty;    
    public string Photo {get; set;} = string.Empty;
}
