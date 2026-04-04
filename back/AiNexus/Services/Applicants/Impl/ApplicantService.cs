using AiNexus.Dtos.Applicants;
using AiNexus.Helpers;
using AiNexus.Helpers.Paginations;
using AiNexus.Helpers.QRCode;
using AiNexus.Infrastructure.Email;
using AutoMapper;
using Library.Dtos.Applicants;
using Library.Helpers.ApplicationExceptions;
using Library.Helpers.Constants;
using Library.Helpers.DbContexts;
using Library.Helpers.Paginations;
using Library.Models;
using Library.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AiNexus.Services.Applicants.Impl;

public class ApplicantService : BaseService, IApplicantService
{
    private readonly AppPostgreSQLDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IEmailService _emailService;

    public ApplicantService(
        AppPostgreSQLDbContext context,
        IOptions<AppSettings> appSettings,
        IMapper mapper,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor
    ) : base(httpContextAccessor)
    {
        _context = context;
        _appSettings = appSettings.Value;
        _mapper = mapper;
        _emailService = emailService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ApplicantDto> SubmitAsync(CreateApplicantRequest request)
    {

        //var exists = await _context.Applicants.AnyAsync(x => x.Email == request.Email);
        //if (exists)
        //{
        //    throw new BadRequestException("An applicant with this email already exists.");
        //}

        var preview = ImageHelper.ToPreviewBase64(request.Photo);

        var applicant = new Applicant
        {
            Name = request.Name,
            Surname = request.Surname,
            Patronymic = request.Patronymic,
            Email = request.Email,
            Phone = request.Phone,
            Photo =  request.Photo,
            Preview = preview,
            Status = "Submitted",
            TemporaryToken = Guid.NewGuid().ToString("N"),
            TemporaryTokenExpiresAt = DateTime.UtcNow.AddHours(24),
        };

        _context.Applicants.Add(applicant);
        await _context.SaveChangesAsync();

        await SendUrlForApplicantAsync(applicant);
        return _mapper.Map<ApplicantDto>(applicant);
    }


    public async Task<PagedResponse<ApplicantShortDto>> GetApplicantsAsync(PaginationParameters parameters)
    {
        var query = _context.Applicants
            .OrderByDescending(x => x.CreatedAt)
            .Select(a => new ApplicantShortDto
            {
                Id = a.Id,
                Name = a.Name,
                Surname = a.Surname,
                Patronymic = a.Patronymic,
                Email = a.Email,
                Status = a.Status,
                Preview = a.Preview,
                Score = _context.TestSessions
                    .Where(ts => ts.ApplicantId == a.Id)
                    .OrderByDescending(ts => ts.FinishedAt)
                    .Select(ts => ts.Score)
                    .FirstOrDefault()
            });

        var count = await query.CountAsync();

        var items = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResponse<ApplicantShortDto>
        {
            Items = items,
            TotalCount = count,
            CurrentPage = parameters.PageNumber,
            PageSize = parameters.PageSize
        };
    }


    public async Task<ApplicantDto> GetApplicantByIdAsync(Guid id)
    {
        var applicant = await _context.Applicants.FindAsync(id);
        if (applicant == null)
            throw new NotFoundException();

        var response = _mapper.Map<ApplicantDto>(applicant);

        var testSession = await _context.TestSessions
                                .OrderByDescending(ts => ts.FinishedAt)
                                .FirstOrDefaultAsync(ts => ts.ApplicantId == id);

        if (testSession != null)
        {
            response.Score = testSession.Score;
            response.TestResultDetails = testSession.AnalyticResult;
            response.EditScore = testSession.EditScore;
            response.EditReason = testSession.EditReason;
        }

        return response;
    }

    public async Task<ApplicantDto> GetApplicantByTokenAsync(string token)
    {
        var applicant = await _context.Applicants.FirstOrDefaultAsync(a => a.TemporaryToken == token);
        if (applicant == null || applicant.TemporaryTokenExpiresAt < DateTime.UtcNow)
            throw new NotFoundException("Token not found or expired");

        return _mapper.Map<ApplicantDto>(applicant);
    }


    private async Task SendUrlForApplicantAsync(Applicant applicant)
    {
        if (applicant == null)
            throw new NotFoundException("Applicant is empty");

        var temporaryLink = $"{_appSettings.BaseUrl}/test/{applicant.TemporaryToken}";
        var expiresAtUtc = applicant.TemporaryTokenExpiresAt.ToString("dd.MM.yyyy HH:mm 'UTC'") ?? "не указано";
        var qrBase64 = QrCodeHelper.GenerateQrCodeBase64(temporaryLink);
        var qrBytes = Convert.FromBase64String(qrBase64);

        var fullName = string.Join(" ", new[]
        {
            applicant.Surname,
            applicant.Name,
            applicant.Patronymic
        }.Where(x => !string.IsNullOrWhiteSpace(x)));

        var subject = "Ссылка на прохождение тестирования inVision U";

        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <h2>Здравствуйте, {fullName}!</h2>
                <p>
                    Благодарим вас за подачу заявки.
                </p>
                <p>
                    Для прохождения тестирования перейдите по ссылке ниже:
                </p>
                <p>
                    <a href='{temporaryLink}' target='_blank'
                       style='display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;'>
                        Перейти к тестированию
                    </a>
                </p>

                <p>Или отсканируйте QR-код:</p>
                <img src='cid:qrcode' alt='QR Code' style='width:220px;height:220px;' />
                <p>
                    <strong>Важно:</strong> ссылка действительна до <strong>{expiresAtUtc}</strong>.
                </p>
                <p>
                    Если срок действия ссылки истёк, обратитесь к администратору.
                </p>
                <br/>
                <p>С уважением,<br/>Команда inVision U</p>
            </body>
            </html>";

        await _emailService.SendEmailAsync(
            applicant.Email,
            fullName,
            subject,
            htmlBody,
            qrBytes,
            "qrcode"
        );
    }
}
