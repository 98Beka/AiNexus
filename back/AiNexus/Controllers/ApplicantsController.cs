using AiNexus.Helpers.Paginations;
using AiNexus.Services.Applicants;
using Library.Dtos.Applicants;
using Library.Helpers.Constants;
using Library.Helpers.Paginations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[Route(AppRoutes.Applicants)]
[ApiController]
public class ApplicantsController : ControllerBase
{
    private readonly IApplicantService _applicantService;
    private readonly ILogger<ApplicantsController> _logger;

    public ApplicantsController(IApplicantService applicantService, ILogger<ApplicantsController> logger)
    {
        _applicantService = applicantService;
        _logger = logger;
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
    public async Task<PagedResponse<ApplicantDto>> GetApplicants(PaginationParameters parameters)
    {
        var res = await _applicantService.GetApplicantsAsync(parameters);
        return res;
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
