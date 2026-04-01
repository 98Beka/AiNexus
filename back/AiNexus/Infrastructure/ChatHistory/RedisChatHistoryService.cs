using AiNexus.Models.ChatHistory;
using StackExchange.Redis;
using System.Text.Json;

namespace AiNexus.Infrastructure.ChatHistory;

public interface IChatHistoryService {
    Task AddMessageAsync(string sessionId, HistoryChatMessage message);
    Task<List<HistoryChatMessage>> GetHistoryAsync(string sessionId);
    Task ClearHistoryAsync(string sessionId);
}

public class RedisChatHistoryService : IChatHistoryService {
    private readonly IDatabase _db;
    private readonly TimeSpan _expiry = TimeSpan.FromHours(24); // Время жизни сессии

    public RedisChatHistoryService(IConnectionMultiplexer redis) {
        // Получаем базу данных по умолчанию (DB 0)
        _db = redis.GetDatabase();
    }

    private static string GetKey(string sessionId) => $"chat_history:{sessionId}";

    public async Task AddMessageAsync(string sessionId, HistoryChatMessage message) {
        var key = GetKey(sessionId);
        var json = JsonSerializer.Serialize(message);

        // Добавляем сообщение в конец списка (RPUSH)
        await _db.ListRightPushAsync(key, json);

        // Обновляем время жизни ключа (TTL), чтобы старые чаты удалялись
        await _db.KeyExpireAsync(key, _expiry);
    }

    public async Task<List<HistoryChatMessage>> GetHistoryAsync(string sessionId) {
        var key = GetKey(sessionId);

        // Получаем все элементы списка от начала (0) до конца (-1) (LRANGE)
        var redisValues = await _db.ListRangeAsync(key, 0, -1);

        if (redisValues.Length == 0)
            return new List<HistoryChatMessage>();

        // Десериализуем элементы обратно в объекты
        return redisValues
            .Select(val => JsonSerializer.Deserialize<HistoryChatMessage>(val!))
            .Where(msg => msg != null)
            .ToList()!;
    }

    public async Task ClearHistoryAsync(string sessionId) {
        var key = GetKey(sessionId);
        await _db.KeyDeleteAsync(key);
    }
}