namespace Library.Dtos.Applicants;

public class ApplicantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string? Patronymic { get; set; }
    public string Photo { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; }
    public int? Score { get; set; }
    public string? TestResultDetails { get; set; }
    public string TemporaryToken { get; set; }
    public DateTime TemporaryTokenExpiresAt { get; set; }
}
