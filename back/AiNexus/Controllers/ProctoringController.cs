using AiNexus.Models.Proctoring;
using AiNexus.Services.Proctoring;
using AutoMapper;
using Library.Helpers.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiNexus.Controllers;
[Route(AppRoutes.Proctoring)]
[ApiController]
[Authorize]
public class ProctoringController:ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IProctoringService _proctoringService;
    public ProctoringController(IProctoringService proctoringService, IMapper mapper)
    {
        _proctoringService = proctoringService;
        _mapper = mapper;
    }

    [HttpPost("comparison_faces")]
    public async Task<ActionResult<ComparisonFacesResponse>> ComparisonFacesAsync(PhotoRequest photoRequest)
    {
        if(photoRequest == null)return NotFound();
        var userId = User.Claims.FirstOrDefault(x => x.Type == "id")?.Value;
        var res = await _proctoringService.ComparisonFacesAsync(photoRequest,userId);
        
        return Ok(res);
    }
    
}