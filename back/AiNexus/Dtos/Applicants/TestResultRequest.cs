using System.ComponentModel.DataAnnotations;

namespace Library.Dtos.Applicants;

public class TestResultRequest
{
    [Required]
    public int Score { get; set; }

    public string? TestResultDetails { get; set; }
}
