using AutoMapper;
using Library.Dtos;
using Library.Dtos.Accounts;
using Library.Helpers.ApplicationExceptions;
using Library.Helpers.Constants;
using Library.Helpers.DbContexts;
using Library.Helpers.Extensions;
using Library.Helpers.Jwts;
using Library.Helpers.Paginations;
using Library.Mappers.Accounts;
using Library.Models.Accounts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace Library.Services.Accounts.Impl;

public class DefaultAccountService : BaseService, IAccountService
{
    private readonly AppPostgreSQLDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly UserManager<Account> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IMapper _mapper;
    private readonly IRoleMapper _roleMapper;
    private readonly IJwtUtils _jwtUtils;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DefaultAccountService(
        AppPostgreSQLDbContext context,
        IOptions<AppSettings> appSettings,
        UserManager<Account> userManager,
        RoleManager<Role> roleManager,
        IMapper mapper,
        IRoleMapper roleMapper,
        IJwtUtils jwtUtils,
        IHttpContextAccessor httpContextAccessor
    ) : base(httpContextAccessor)
    {
        _context = context;
        _appSettings = appSettings.Value;
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _roleMapper = roleMapper;
        _jwtUtils = jwtUtils;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthenticateResponse> LoginAsync(LoginRequest request)
    {
        var account = await _userManager.Users
            .Include(a => a.RefreshTokens)
            .Include(a => a.Settings)
            .Include(a => a.Sessions)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        // validate
        if (account is null)
        {
            throw new BadRequestException("IncorrectEmail");
        }

        if (!account.IsEnabled)
        {
            throw new BadRequestException("AccountDisabled");
        }

        if (await _userManager.IsLockedOutAsync(account))
        {
            throw new BadRequestException("AccountBlocked");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(account, request.Password);
        if (!isPasswordValid)
        {
            await _userManager.AccessFailedAsync(account);

            if (await _userManager.GetAccessFailedCountAsync(account) > AppConstants.MaxFailedAccessAttempts)
            {
                await _userManager.SetLockoutEndDateAsync(account, DateTimeOffset.Now.AddMinutes(AppConstants.LockoutTimeSpan_Minutes));

                throw new BadRequestException(
                    $"ExceededNumberFailedLoginAttempts|{AppConstants.LockoutTimeSpan_Minutes}"
                );
            }

            throw new BadRequestException("IncorrectPassword");
        }

        await _userManager.ResetAccessFailedCountAsync(account);

        //if ((DateTime.Now - account.LastPasswordChangeDate).TotalDays > AppConstants.PasswordChangePeriodDays)
        //{
        //    throw new BadRequestException("PasswordOutdated");
        //}

        // authentication successful so generate jwt and refresh tokens
        var session = new Session()
        {
            IpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            Browser = _httpContextAccessor.HttpContext.Request.Headers["User-Agent"].ToString(),
            Account = account
        };
        var refreshToken = generateRefreshToken();
        account.RefreshTokens.Add(refreshToken);

        // remove old refresh tokens from account
        removeOldRefreshTokens(account);

        // save changes to db
        _context.Sessions.Add(session);
        _context.Update(account);
        _context.SaveChanges();

        var jwtToken = _jwtUtils.GenerateJwtToken(account);

        AuthenticateResponse response = _mapper.Map<AuthenticateResponse>(account);
        response.AccessToken = jwtToken;
        response.RefreshToken = refreshToken.Token;
        response.Role = _roleMapper.ToRole(account);
        return response;
    }

    public async Task LogOutAsync()
    {
        var accountId = getCurrentAccountId();
        var lastSession = _context.Sessions
                .Where(s => s.AccountId == accountId)
                .OrderBy(s => s.Id)
                .Last();
        if (lastSession == null || lastSession.LoggedOutAt != null)
        {
            throw new BadRequestException("AlreadyLoggedOut");
        }
        lastSession.LoggedOutAt = DateTime.Now;
        await _context.SaveChangesAsync();

        var account = _context.Users.FirstOrDefault(a => a.Id == accountId);
    }
    public async Task<AuthenticateResponse> RefreshTokenAsync(string token)
    {
        var account = await getAccountByRefreshToken(token);
        var refreshToken = account.RefreshTokens.First(x => x.Token == token);

        if (refreshToken.IsExpired)
        {
            throw new BadRequestException("InvalidToken");
        }

        // replace old refresh token with a new one (rotate token)
        var newRefreshToken = generateRefreshToken();
        account.RefreshTokens.Add(newRefreshToken);

        _context.Remove(refreshToken);

        // remove old refresh tokens from account
        removeOldRefreshTokens(account);

        // save changes to db
        _context.Update(account);
        _context.SaveChanges();

        // generate new jwt
        var jwtToken = _jwtUtils.GenerateJwtToken(account);

        // return data in authenticate response object
        var response = _mapper.Map<AuthenticateResponse>(account);
        response.AccessToken = jwtToken;
        response.RefreshToken = newRefreshToken.Token;
        response.Role = _roleMapper.ToRole(account);

        return response;
    }

    public async Task<string> EnableDisableAsync(string id, bool value)
    {
        var accountId = getCurrentAccountId();
        if (accountId == id)
        {
            throw new AppException("SelfDisableError");
        }
        var account = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (account is null)
        {
            throw new NotFoundException($"AccountByIdNotFound|{id}");
        }

        if (account.IsEnabled == value)
        {
            if (account.IsEnabled)
            {
                throw new AppException($"AccountAlreadyEnabled|{id}");
            }
            else
            {
                throw new AppException($"AccountAlreadyDisabled|{id}");
            }
        }

        var accountOld = account.DeepCopy();

        account.IsEnabled = value;
        var result = await _context.SaveChangesAsync();

        return id;
    }

    public async Task<AccountSettingsDto> UpdateSettingsAsync(AccountSettingsDto dto)
    {
        var accountId = getCurrentAccountId();
        var accountSettings = await _context.AccountSettings
            .FirstOrDefaultAsync(u => u.AccountId == accountId);

        if (accountSettings is null)
        {
            throw new NotFoundException($"AccountSettingsNotFound");
        }

        accountSettings.Language = dto.Language;
        accountSettings.Theme = dto.Theme;
        await _context.SaveChangesAsync();

        var result = _mapper.Map<AccountSettingsDto>(accountSettings);

        return result;
    }

    public async Task<AccountDto> GetAsync(string id)
    {
        var account = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (account is null)
        {
            throw new NotFoundException($"AccountByIdNotFound|{id}");
        }

        AccountDto response = _mapper.Map<AccountDto>(account);
        var role = await _roleManager.FindByNameAsync(_roleMapper.ToRole(account));
        response.Role = new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description
        };

        return response;
    }

    public async Task<PagedList<AccountDto>> SearchAsync(PagedSearchRequestDto<AccountFilterRequest> request)
    {
        var paginationParameters = request.Pagination;
        var filterParameters = request.Filter;

        var filteredAccounts = _userManager.Users
            .Where(u => u.Id != getCurrentAccountId());

        if (!string.IsNullOrEmpty(filterParameters.Email))
        {
            filteredAccounts = filteredAccounts.Where(a => a.UserName == filterParameters.Email);
        }

        if (!string.IsNullOrEmpty(filterParameters.Surname))
        {
            filteredAccounts = filteredAccounts.Where(a => a.Surname.Contains(filterParameters.Surname));
        }

        if (!string.IsNullOrEmpty(filterParameters.Name))
        {
            filteredAccounts = filteredAccounts.Where(a => a.Name.Contains(filterParameters.Name));
        }

        if (!string.IsNullOrEmpty(filterParameters.Patronymic))
        {
            filteredAccounts = filteredAccounts.Where(a => a.Patronymic != null && a.Patronymic.Contains(filterParameters.Patronymic));
        }

        var totalCount = filteredAccounts.Count();
        var result = await filteredAccounts
            .Skip((request.Pagination.PageNumber - 1) * request.Pagination.PageSize)
            .Take(request.Pagination.PageSize)
            .ToListAsync();

        List<AccountDto> response = _mapper.Map<List<AccountDto>>(result);

        foreach (var r in response)
        {
            var role = await _roleManager.FindByNameAsync(_roleMapper.ToRole(result.First(x => x.Id == r.Id)));
            r.Role = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description
            };
        }
        return new PagedList<AccountDto>(response, totalCount, paginationParameters.PageNumber, paginationParameters.PageSize);
    }

    public async Task<List<RoleDto>> GetRolesAsync()
    {
        var roles = await _roleManager.Roles
            .Select(r => new RoleDto { Id = r.Id, Name = r.Name, Description = r.Description }).ToListAsync();

        return roles;
    }

    public async Task<AccountDto> CreateAsync(RegisterRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            throw new BadRequestException($"AccountWithEmailAlreadyExists|{request.Email}");
        }

        var role = await _roleManager.FindByIdAsync(request.RoleId)
            ?? throw new NotFoundException($"Role by roleId = {request.RoleId} not found");


        Account account = new Account
        {
            Email = request.Email,
            UserName = request.Email,
            Surname = request.Surname,
            Name = request.Name,
            Patronymic = request.Patronymic,
        };

        var result = await _userManager.CreateAsync(account, request.Password);
        if (!result.Succeeded)
        {
            throw new AppException($"failed to create account by email = {request.Email}\n" +
                                   result.Errors.Select(error => $"Code = {error.Code}\tDescription = {error.Description}")
                                       .Aggregate((current, next) => $"{current}\n{next}"));
        }

        await _userManager.AddToRoleAsync(account, role.Name);


        AccountDto response = _mapper.Map<AccountDto>(account);
        response.Role = new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description
        };

        return response;
    }

    public async Task<string> DeleteAsync(string id)
    {
        var account = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (account is null)
        {
            throw new NotFoundException($"AccountByIdNotFound|{id}");
        }

        var result = await _userManager.DeleteAsync(account);
        if (!result.Succeeded)
        {
            throw new AppException($"failed to delete account by id = {id}\n" +
                                   result.Errors.Select(error => $"Code = {error.Code}\tDescription = {error.Description}")
                                       .Aggregate((current, next) => $"{current}\n{next}"));
        }

        return id;
    }

    public async Task<AccountDto> UpdateAccountAsync(UpdateAccountRequest req)
    {
        var account = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == req.Id)
            ?? throw new NotFoundException($"AccountByIdNotFound|{req.Id}");

        _mapper.Map(req, account);

        account.UpdatedAt = DateTime.Now;

        await UpdateUserRole(account, req.RoleId);

        await _context.SaveChangesAsync();

        var response = _mapper.Map<AccountDto>(account);

        var role = await _roleManager.FindByNameAsync(_roleMapper.ToRole(account));

        response.Role = new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description
        };
        return response;
    }

    public async Task<string> ChangePassword(ChangePasswordRequest request)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null)
        {
            throw new NotFoundException($"AccountByEmailNotFound|{request.Email}");
        }

        if (!user.IsEnabled)
        {
            throw new BadRequestException("AccountDisabled");
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            throw new BadRequestException("AccountBlocked");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
        if (!isPasswordValid)
        {
            await _userManager.AccessFailedAsync(user);

            if (await _userManager.GetAccessFailedCountAsync(user) > AppConstants.MaxFailedAccessAttempts)
            {
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.Now.AddMinutes(AppConstants.LockoutTimeSpan_Minutes));

                throw new BadRequestException(
                    $"ExceededNumberFailedLoginAttempts|{AppConstants.LockoutTimeSpan_Minutes}"
                );
            }

            throw new BadRequestException("IncorrectPassword");
        }

        await _userManager.ResetAccessFailedCountAsync(user);

        var userOld = user.DeepCopy();

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            throw new AppException($"failed to change password\n" +
                                   result.Errors.Select(error => $"Code = {error.Code}\tDescription = {error.Description}")
                                       .Aggregate((current, next) => $"{current}\n{next}"));
        }

        user.LastPasswordChangeDate = DateTime.Now;

        await _userManager.UpdateAsync(user);

        return user.Id;
    }

    public async Task<MyAccountInfo> GetMyAccountInfo()
    {
        var account = await _userManager.Users
            .Include(a => a.Settings)

            .FirstOrDefaultAsync(a => a.Id == getCurrentAccountId());

        if (account is null)
        {
            throw new BadRequestException("NotLogedIn");
        }

        if (!account.IsEnabled)
        {
            throw new BadRequestException("AccountDisabled");
        }

        if (await _userManager.IsLockedOutAsync(account))
        {
            throw new BadRequestException("AccountBlocked");
        }

        MyAccountInfo accountInfo = _mapper.Map<MyAccountInfo>(account);
        accountInfo.Role = _roleMapper.ToRole(account);

        return accountInfo;
    }

    public async Task<PagedList<AccountDto>> SearchReadersAsync(PagedSearchRequestDto<AccountFilterRequest> request)
    {
        var paginationParameters = request.Pagination;
        var filterParameters = request.Filter;

        var filteredAccounts = _userManager.Users
            .Where(u => u.Id != getCurrentAccountId());

        var readerRole = await _roleManager.FindByNameAsync(Enums.Accounts.Role.reader.ToString());

        filteredAccounts = filteredAccounts
                    .Where(u => _context.UserRoles
                        .Any(ur => ur.UserId == u.Id && _context.Roles
                            .Any(r => r.Id == ur.RoleId && r.Name == readerRole.Name)));

        if (!string.IsNullOrEmpty(filterParameters.Email))
        {
            filteredAccounts = filteredAccounts
                .Where(a => a.UserName == filterParameters.Email);
        }

        if (!string.IsNullOrEmpty(filterParameters.Surname))
        {
            filteredAccounts = filteredAccounts
                .Where(a => a.Surname.Contains(filterParameters.Surname));
        }

        if (!string.IsNullOrEmpty(filterParameters.Name))
        {
            filteredAccounts = filteredAccounts
                .Where(a => a.Name.Contains(filterParameters.Name));
        }

        if (!string.IsNullOrEmpty(filterParameters.Patronymic))
        {
            filteredAccounts = filteredAccounts
                .Where(a => a.Patronymic != null && a.Patronymic.Contains(filterParameters.Patronymic));
        }

        var totalCount = await filteredAccounts.CountAsync();
        var result = await filteredAccounts
            .Skip((request.Pagination.PageNumber - 1) * request.Pagination.PageSize)
            .Take(request.Pagination.PageSize)
            .ToListAsync();

        List<AccountDto> response = _mapper.Map<List<AccountDto>>(result);

        return new PagedList<AccountDto>(response, totalCount, paginationParameters.PageNumber, paginationParameters.PageSize);
    }


    // hepler methods
    private RefreshToken generateRefreshToken()
    {
        var refreshToken = new RefreshToken
        {
            // token is a cryptographically strong random sequence of values
            Token = Convert.ToHexString(RandomNumberGenerator.GetBytes(64)),
            // token is valid for
            Expires = DateTime.Now.AddMinutes(_appSettings.RefreshTokenTTL),
            Created = DateTime.Now,
        };

        // ensure token is unique by checking against db
        var tokenIsUnique = !_userManager.Users.Any(a => a.RefreshTokens.Any(t => t.Token == refreshToken.Token));

        if (!tokenIsUnique)
        {
            return generateRefreshToken();
        }

        return refreshToken;
    }

    private async Task<Account> getAccountByRefreshToken(string token)
    {
        var account = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == token));

        if (account is null)
        {
            throw new BadRequestException("InvalidToken");
        }

        return account;
    }

    private void removeOldRefreshTokens(Account account)
    {
        account.RefreshTokens.RemoveAll(x => x.IsExpired);
    }

    private async Task UpdateUserRole(Account account, string roleId)
    {
        var currentRoles = await _userManager.GetRolesAsync(account);

        var role = await _roleManager.FindByIdAsync(roleId);
        if (role is null)
            throw new Exception($"Роль с Id='{roleId}' не найдена.");

        if (currentRoles.Any())
        {
            var result = await _userManager.RemoveFromRolesAsync(account, currentRoles);

        }

        var addResult = await _userManager.AddToRoleAsync(account, role.Name);
        if (!addResult.Succeeded)
        {
            throw new Exception($"Не удалось добавить новую роль: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
        }

    }
}