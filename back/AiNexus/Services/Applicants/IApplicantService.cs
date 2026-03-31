using AiNexus.Helpers.Paginations;
using Library.Dtos.Applicants;
using Library.Helpers.Paginations;

namespace AiNexus.Services.Applicants;

public interface IApplicantService
{
    Task<ApplicantDto> SubmitAsync(CreateApplicantRequest request);
    Task<PagedResponse<ApplicantDto>> GetApplicantsAsync(PaginationParameters parameters);
    Task<ApplicantDto> GetApplicantByIdAsync(Guid id);
    Task<ApplicantDto> GetApplicantByTokenAsync(string token);
    Task<ApplicantDto> UpdateTestAsync(Guid id, TestResultRequest request);

}
