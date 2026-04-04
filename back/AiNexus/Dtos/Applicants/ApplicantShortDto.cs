namespace AiNexus.Dtos.Applicants;

public class ApplicantShortDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string? Patronymic { get; set; }
    public string Email { get; set; }
    public string Preview { get; set; }
    public string Photo { get; set; }
    public string Status { get; set; }
    public int? Score { get; set; }
}
