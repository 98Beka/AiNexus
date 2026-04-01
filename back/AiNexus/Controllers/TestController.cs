using System.ComponentModel.DataAnnotations;
using AiNexus.Dtos.Test;
using AiNexus.Services.Test;
using Library.Dtos.Test;
using Library.Helpers.Constants;
using Microsoft.AspNetCore.Mvc;

namespace AiNexus.Controllers;
[Route(AppRoutes.Test)]
[ApiController]
public class TestController:Controller
{
    private readonly ITestService _testService;
    public TestController(ITestService testService)
    {
        _testService = testService;
    }

    [HttpPost("initialize")]
    public async Task<IActionResult> TestInitialize([FromBody] TestInitRequest request)
    {
        if (request == null)
            return BadRequest();
        var userId = User.Claims.FirstOrDefault(x => x.Type == "id")?.Value;

        var res = await _testService.Initialize(request,userId);
        return Ok(res);
    }
    [HttpPost("finish")]
    public async Task<IActionResult> TestFinish()
    {
        var userId = User.Claims.FirstOrDefault(x => x.Type == "id")?.Value;
        var res = await _testService.Finished(userId); 
        return Ok(res);
    }

    [HttpPost("update-score")]
    public async Task<IActionResult> UpdateTestScore([Required] UpdateTestScoreRequest request)
    {
        var res = await _testService.UpdateTestScoreAsync(request);
        return Ok(res);
    }
}