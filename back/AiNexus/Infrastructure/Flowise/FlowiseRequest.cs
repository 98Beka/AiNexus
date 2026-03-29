namespace AiNexus.Infrastructure.Flowise;

public class FlowiseRequest {
    public string Message { get; set; } = string.Empty;
    public string ChatId { get; set; }
    public CancellationToken CancellationToken { get; set; }
}
