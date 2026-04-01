using AiNexus.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AiNexus.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AgentController : ControllerBase {
    private readonly IAgentProfileService _service;

    public AgentController(IAgentProfileService service) {
        _service = service;
    }

    [HttpGet("ideal-applicant-description")]
    public async Task<IActionResult> Get() {
        var result = await _service.GetIdealApplicantDescriptionAsync();
        return Ok(result);
    }

    [HttpPost("ideal-applicant-description")]
    public async Task<IActionResult> Post([FromBody] string description) {
        await _service.SetIdealApplicantDescriptionAsync(description);
        return Ok();
    }
}