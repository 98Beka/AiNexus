using AiNexus.Dtos.Test;
using AiNexus.Enums;
using AiNexus.Infrastructure.ChatHistory;
using AiNexus.Infrastructure.Flowise;
using AiNexus.Models;
using Library.Dtos.Test;
using Library.Helpers.ApplicationExceptions;
using Library.Helpers.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace AiNexus.Services.Test.Impl;

public class TestService:ITestService
{
    private readonly IFlowiseService _flowiseService;
    private readonly AppPostgreSQLDbContext _context;
    private readonly IChatHistoryService _chatHistoryService;

    public TestService(
        AppPostgreSQLDbContext context,
        IFlowiseService flowiseService,
        IChatHistoryService chatHistoryService
        )
    {
        _context = context;
        _flowiseService = flowiseService;
        _chatHistoryService = chatHistoryService;
    }
    public async Task<bool> Initialize(TestInitRequest request, string userId)
    {
        var userGuid = Guid.Parse(userId);

        var applicant = await _context.Applicants.FirstOrDefaultAsync(a=>a.Id ==userGuid );
        if (applicant == null) return false;

        var testRes = new TestSession
        {
            StartedAt =  DateTime.Now,
            ApplicantId = applicant.Id,
            ChatSessionId =  request.ChatSessionId,
        };
        await _context.TestSessions.AddAsync(testRes);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Finished(string userId)
    {
        var userGuid = Guid.Parse(userId);
        var applicant = await _context.Applicants.FirstOrDefaultAsync(a=>a.Id == userGuid);
        if (applicant == null) return false;
        var test = await _context.TestSessions.FirstOrDefaultAsync(t => t.ApplicantId == applicant.Id);
        if (test == null) return false;
        test.IsCompleted = true;
        test.FinishedAt = DateTime.Now;

        var history = await _chatHistoryService.GetHistoryAsync(test.ChatSessionId);
        var historyStr = string.Join("\n", history.Select(h => $"{h.Role}: {h.Content}"));

        var msgRequest = new FlowiseRequest()
        {
            Message = historyStr,
            Agent = AgentNameEnum.scoring_agent.ToString(),
            ChatId = test.ChatSessionId
        };
        var res = await _flowiseService.SendMessageAsync(msgRequest);
        test.AnalyticResult = res;

        _context.Update(test);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> UpdateTestScoreAsync(UpdateTestScoreRequest request)
    {
        var test = await _context.TestSessions.FirstOrDefaultAsync(t => t.ApplicantId == request.ApplicantId);
        if (test == null)
            throw new NotFoundException($"Test not found for applicant - {request.ApplicantId}");

        test.Score = request.Score;
        await _context.SaveChangesAsync();
        return request.Score;
    }
}