using Library.Dtos;
using Library.Dtos.Accounts;
using Library.Helpers.Paginations;

namespace Library.Services.Accounts
{
    public interface IAccountService
    {
        Task<AuthenticateResponse> LoginAsync(LoginRequest request);
        Task LogOutAsync();
        Task<AuthenticateResponse> RefreshTokenAsync(string token);
        Task<AccountDto> GetAsync(string id);
        Task<PagedList<AccountDto>> SearchAsync(PagedSearchRequestDto<AccountFilterRequest> request);
        Task<List<RoleDto>> GetRolesAsync();
        Task<AccountDto> CreateAsync(RegisterRequest request);
        Task<string> DeleteAsync(string id);
        Task<AccountDto> UpdateAccountAsync(UpdateAccountRequest req);
        Task<string> ChangePassword(ChangePasswordRequest request);
        Task<string> EnableDisableAsync(string id, bool value);
        Task<AccountSettingsDto> UpdateSettingsAsync(AccountSettingsDto dto);
        Task<MyAccountInfo> GetMyAccountInfo();
        Task<PagedList<AccountDto>> SearchReadersAsync(PagedSearchRequestDto<AccountFilterRequest> request);
    }
}
