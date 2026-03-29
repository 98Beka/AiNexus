using Library.Dtos;
using Library.Dtos.Accounts;
using Library.Enums.Accounts;
using Library.Helpers.Attributes;
using Library.Helpers.Constants;
using Library.Services.Accounts;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Library.Controllers.Accounts
{
    [Authorize]
    [Route(AppRoutes.Authentication)]
    [ApiController]
    public class AuthenticationController(IAccountService service)
        : BaseController
    {
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<AuthenticateResponse> Login([Required] LoginRequest request)
        {
            var response = await service.LoginAsync(request);

            return response;
        }
        [HttpGet("logout")]
        public async Task<IActionResult> LogOut()
        {
            await service.LogOutAsync();

            return Ok("Logged out successfully.");
        }

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<AuthenticateResponse> RefreshToken([Required] string refreshToken)
        {
            var response = await service.RefreshTokenAsync(refreshToken);

            return response;
        }

        [Authorize(Role.admin)]
        [HttpGet("get-account")]
        public async Task<AccountDto> Get([Required] string id)
        {
            var account = await service.GetAsync(id);

            return account;
        }

        [Authorize(Role.admin)]
        [HttpPost("search-accounts")]
        public async Task<PageResponseDto<AccountDto>> Search([Required] PagedSearchRequestDto<AccountFilterRequest> request)
        {
            var accounts = await service.SearchAsync(request);

            return new PageResponseDto<AccountDto>
            {
                CurrentPage = accounts.CurrentPage,
                PageSize = accounts.PageSize,
                TotalPages = accounts.TotalPages,
                TotalCount = accounts.TotalCount,
                Content = accounts,
            };
        }

        [Authorize(Role.admin, Role.moderator)]
        [HttpPost("search-readers")]
        public async Task<PageResponseDto<AccountDto>> SearchReaders([Required] PagedSearchRequestDto<AccountFilterRequest> request)
        {
            var accounts = await service.SearchReadersAsync(request);

            return new PageResponseDto<AccountDto>
            {
                CurrentPage = accounts.CurrentPage,
                PageSize = accounts.PageSize,
                TotalPages = accounts.TotalPages,
                TotalCount = accounts.TotalCount,
                Content = accounts,
            };
        }

        [Authorize(Role.admin)]
        [HttpGet("get-roles")]
        public async Task<List<RoleDto>> GetRolesAsync()
        {
            var roles = await service.GetRolesAsync();

            return roles;
        }

        [Authorize(Role.admin)]
        [HttpPost("create-account")]
        public async Task<IActionResult> Create([Required] RegisterRequest request)
        {
            var response = await service.CreateAsync(request);

            return Ok(response);
        }

        [Authorize(Role.admin)]
        [HttpDelete("delete-account")]
        public async Task<string> Delete([Required] string id)
        {
            var response = await service.DeleteAsync(id);

            return response;
        }

        [Authorize(Role.admin)]
        [HttpPut("update-account")]
        public async Task<AccountDto> Update([Required] UpdateAccountRequest request)
        {
            var response = await service.UpdateAccountAsync(request);
            return response;
        }

        [AllowAnonymous]
        [HttpPut("change-password")]
        public async Task<string> ChangePassword([Required] ChangePasswordRequest request)
        {
            var result = await service.ChangePassword(request);

            return result;
        }

        [Authorize(Role.admin)]
        [HttpPut("enable-disable")]
        public async Task<string> EnableDisable([Required] string id, [Required] bool value)
        {
            var response = await service.EnableDisableAsync(id, value);

            return response;
        }

        [HttpPut("update-settings")]
        public async Task<AccountSettingsDto> UpdateSettings([Required] AccountSettingsDto dto)
        {
            var response = await service.UpdateSettingsAsync(dto);

            return response;
        }

        [Authorize]
        [HttpGet("get-my-account")]
        public async Task<MyAccountInfo> GetMyAccount()
        {
            var response = await service.GetMyAccountInfo();

            return response;
        }
    }
}
