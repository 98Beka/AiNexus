using AiNexus.Dtos.Applicants;
using AiNexus.Helpers.Paginations;
using AiNexus.Infrastructure.ChatHistory;
using AiNexus.Models.ChatHistory;
using AiNexus.Services.Applicants;
using Library.Dtos.Applicants;
using Library.Helpers.Constants;
using Library.Helpers.DbContexts;
using Library.Helpers.Paginations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Library.Controllers;

[Route(AppRoutes.Applicants)]
[ApiController]
public class ApplicantsController : ControllerBase
{
    private readonly IApplicantService _applicantService;
    private readonly ILogger<ApplicantsController> _logger;
    private readonly AppPostgreSQLDbContext _context;
    private readonly IChatHistoryService _chatHistoryService;

    public ApplicantsController(
        IApplicantService applicantService,
        ILogger<ApplicantsController> logger,
        AppPostgreSQLDbContext context,
        IChatHistoryService chatHistoryService
        )
    {
        _applicantService = applicantService;
        _logger = logger;
        _context = context;
        _chatHistoryService = chatHistoryService;
    }

    [AllowAnonymous]
    [HttpPost("submit")]
    public async Task<ActionResult<ApplicantDto>> Submit([FromBody] CreateApplicantRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _applicantService.SubmitAsync(request);
        return Ok(response);
    }

    [Authorize]
    [HttpPost]
    public async Task<PagedResponse<ApplicantShortDto>> GetApplicants(PaginationParameters parameters)
    {
        var res = await _applicantService.GetApplicantsAsync(parameters);
        return res;
    }

    [Authorize]
    [HttpGet("history/{userId}")]
    public async Task<IActionResult> GetHistory(string userId) {
        var user = await _context.Applicants.Where(u => u.Id == Guid.Parse(userId)).FirstOrDefaultAsync();
        if (user == null) {
            return NotFound();
        }
        var lastSessionId = await _context.TestSessions
            .Where(ts => ts.ApplicantId == user.Id)
            .OrderByDescending(ts => ts.StartedAt)
            .Select(ts => ts.ChatSessionId)
            .FirstOrDefaultAsync();

        List<HistoryChatMessage> res = await _chatHistoryService.GetHistoryAsync(lastSessionId);
        return Ok(res);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ApplicantDto> GetById(Guid id)
    {
        return await _applicantService.GetApplicantByIdAsync(id);
    }

    [AllowAnonymous]
    [HttpGet("token/{token}")]
    public async Task<ActionResult<ApplicantDto>> GetByToken(string token)
    {
        return await _applicantService.GetApplicantByTokenAsync(token);
    }

    [Authorize]
    [HttpPut("{id:guid}/test-result")]
    public async Task<ActionResult<ApplicantDto>> UpdateTest(Guid id, [FromBody] TestResultRequest request)
    {
        return await _applicantService.UpdateTestAsync(id, request);
    }
}
