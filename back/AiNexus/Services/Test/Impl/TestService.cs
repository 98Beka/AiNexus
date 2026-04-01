using AiNexus.Dtos.Test;
using AiNexus.Enums;
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

    public TestService(
        AppPostgreSQLDbContext context,
        IFlowiseService flowiseService
        )
    {
        _context = context;
        _flowiseService = flowiseService;
    }
    public async Task<bool> Initialize(TestInitRequest request, string userId)
    {
        var userGuid = Guid.Parse(userId);

        var applicant = await _context.Applicants.FirstOrDefaultAsync(a=>a.Id ==userGuid );
        if (applicant == null) return false;
        var existingTest = await _context.TestSessions.FirstOrDefaultAsync(t => t.ApplicantId == applicant.Id);
        if (existingTest != null) return false;
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

        var msgRequest = new FlowiseRequest()
        {
            Message = "start",
            Agent = AgentNameEnum.scoring_agent.ToString(),
            ChatId = test.ChatSessionId
        };
        var res = await _flowiseService.SendMessageAsync(msgRequest);
        test.AnalyticResult = res;
        
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