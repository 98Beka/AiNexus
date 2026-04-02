using StackExchange.Redis;

namespace AiNexus.Infrastructure;


public interface IAgentProfileService {
    Task<string?> GetIdealApplicantDescriptionAsync();
    Task SetIdealApplicantDescriptionAsync(string description);
}

public class AgentProfileService : IAgentProfileService {
    private const string Key = "agent:ideal_applicant_description";

    private readonly IDatabase _db;

    public AgentProfileService(IConnectionMultiplexer redis) {
        _db = redis.GetDatabase();
    }

    public async Task<string?> GetIdealApplicantDescriptionAsync() {
        return await _db.StringGetAsync(Key);
    }

    public async Task SetIdealApplicantDescriptionAsync(string description) {
        await _db.StringSetAsync(Key, description);
    }
}