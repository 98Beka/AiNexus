using AiNexus.Enums;

namespace AiNexus.Models;

public class TestSession
{
    public Guid Id { get; set; }
    public string ChatSessionId { get; set; }
    public string AnalyticResult { get; set; }=string.Empty;
    public int Score { get; set; }
    public bool IsCompleted { get; set; } = false;
    public bool IsFailed { get; set; } = false;
    public ViolationReasonEnum ViolationReason { get; set; }
    public Guid ApplicantId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
}