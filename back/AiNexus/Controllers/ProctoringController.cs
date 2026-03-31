using AiNexus.Models.Proctoring;
using AiNexus.Services.Proctoring;
using AutoMapper;
using Library.Helpers.Constants;
using Microsoft.AspNetCore.Mvc;

namespace AiNexus.Controllers;
[Route(AppRoutes.Proctoring)]
[ApiController]
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
        var res = await _proctoringService.ComparisonFacesAsync(photoRequest);
        return Ok(res);
    }
    
}