using AiNexus.Dtos.Applicants;
using AiNexus.Helpers.Paginations;
using Library.Dtos.Applicants;
using Library.Helpers.Paginations;

namespace AiNexus.Services.Applicants;

public interface IApplicantService
{
    Task<ApplicantDto> SubmitAsync(CreateApplicantRequest request);
    Task<PagedResponse<ApplicantShortDto>> GetApplicantsAsync(PaginationParameters parameters);
    Task<ApplicantDto> GetApplicantByIdAsync(Guid id);
    Task<ApplicantDto> UpdateTestAsync(Guid id, TestResultRequest request);

}
