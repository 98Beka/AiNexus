namespace AiNexus.Dtos.Emails;

public class SendEmailApiRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string ToName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public byte[]? InlineImageBytes { get; set; } = null;
    public string? InlineImageContentId { get; set; } = null;
}
