using Library.Dtos.Applicants;

namespace AiNexus.Services.Applicants;

public interface IApplicantService
{
    Task<ApplicantDto> SubmitAsync(CreateApplicantRequest request);
    Task<List<ApplicantDto>> GetApplicantsAsync();
    Task<ApplicantDto> GetApplicantByIdAsync(Guid id);
    Task<ApplicantDto> GetApplicantByTokenAsync(string token);
    Task<ApplicantDto> UpdateTestAsync(Guid id, TestResultRequest request);

}
