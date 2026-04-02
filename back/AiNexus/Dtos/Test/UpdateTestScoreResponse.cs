namespace AiNexus.Dtos.Test;

public class UpdateTestScoreResponse
{
    public Guid ApplicantId { get; set; }
    public int Score { get; set; }
    public int EditScore { get; set; }
    public string EditReason { get; set; } = string.Empty;
}
