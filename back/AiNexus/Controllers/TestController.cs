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

        var res = await _testService.Initialize(request);
        return Ok(res);
    }
    [HttpPost("finish")]
    public async Task<IActionResult> TestFinish([FromBody] TestFinishRequest request)
    {
        if (request == null)
            return BadRequest();

        var res = await _testService.Finished(request); 
        return Ok(res);
    }
}