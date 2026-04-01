using System.Text.Json.Serialization;

namespace AiNexus.Models.ChatHistory;

public record HistoryChatMessage(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content
);