namespace AiNexus.Models.Chats;

public class ChatStreamChunk {
    public string Content { get; set; }
    public bool IsComplete { get; set; }
    public ChatStreamChunk(string content, bool isComplete) {
        Content = content;
        IsComplete = isComplete;
    }
}
