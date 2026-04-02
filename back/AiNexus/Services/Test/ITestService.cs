using AiNexus.Dtos.Test;
using Library.Dtos.Test;

namespace AiNexus.Services.Test;

public interface ITestService
{
    Task<bool> Initialize(TestInitRequest request,string userId);
    Task<bool> Finished(string userId);
    Task<UpdateTestScoreResponse> UpdateTestScoreAsync(UpdateTestScoreRequest request);
}