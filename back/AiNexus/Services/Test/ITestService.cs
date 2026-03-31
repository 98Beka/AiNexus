using Library.Dtos.Test;

namespace AiNexus.Services.Test;

public interface ITestService
{
    Task<bool> Initialize(TestInitRequest request);
    Task<bool> Finished(TestFinishRequest request);
}