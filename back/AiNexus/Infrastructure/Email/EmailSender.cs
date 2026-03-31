using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using AiNexus.Helpers.ApplicationExceptions;
using AiNexus.Dtos.Emails;
using AiNexus.Constants;

namespace AiNexus.Infrastructure.Email;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
}

public class EmailSender : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly EmailApiSettings _settings;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(
        HttpClient httpClient,
        IOptions<EmailApiSettings> settings,
        IHttpContextAccessor httpContextAccessor,
        ILogger<EmailSender> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext
                ?? throw new UnauthorizedAccessException("HttpContext is not available.");

            var token = await httpContext.GetTokenAsync("access_token");

            if (string.IsNullOrWhiteSpace(token))
            {
                var authHeader = httpContext.Request.Headers.Authorization.ToString();

                if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
                    throw new UnauthorizedAccessException("Access token not found.");

                token = authHeader["Bearer ".Length..].Trim();
            }

            var requestBody = new SendEmailApiRequest
            {
                ToEmail = toEmail,
                ToName = toName,
                Subject = subject,
                HtmlBody = htmlBody
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, _settings.SendEndpoint)
            {
                Content = JsonContent.Create(requestBody)
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Email API returned {StatusCode}. Response: {Response}", response.StatusCode, errorBody);
                throw new EmailException($"Email API failed with status code {(int)response.StatusCode}.");
            }

            _logger.LogInformation("Email successfully sent to {Email}", toEmail);
        }
        catch (EmailException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} with subject {Subject}", toEmail, subject);
            throw new EmailException("Failed to send email via external email API.", ex);
        }
    }
}