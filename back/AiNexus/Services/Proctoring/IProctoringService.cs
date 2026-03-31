using AiNexus.Models.Proctoring;

namespace AiNexus.Services.Proctoring;

public interface IProctoringService
{
    Task<ComparisonFacesResponse> ComparisonFacesAsync(PhotoRequest request);
}