using System.Net.Http.Json;
using AiNexus.Constants;
using AiNexus.Dtos.Emails;
using AiNexus.Helpers.ApplicationExceptions;
using Microsoft.Extensions.Options;

namespace AiNexus.Infrastructure.Email;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, byte[]? inlineImageBytes, string? inlineImageContentId);
}

public class EmailSender : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly EmailApiSettings _settings;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(
        HttpClient httpClient,
        IOptions<EmailApiSettings> settings,
        ILogger<EmailSender> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, byte[]? inlineImageBytes, string? inlineImageContentId)
    {
        try
        {
            var requestBody = new SendEmailApiRequest
            {
                ToEmail = toEmail,
                ToName = toName,
                Subject = subject,
                HtmlBody = htmlBody,
                InlineImageBytes = inlineImageBytes,
                InlineImageContentId = inlineImageContentId
            };

            var response = await _httpClient.PostAsJsonAsync(_settings.SendEndpoint, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();

                _logger.LogError(
                    "Email API returned {StatusCode}. Response: {Response}",
                    response.StatusCode,
                    errorBody);

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