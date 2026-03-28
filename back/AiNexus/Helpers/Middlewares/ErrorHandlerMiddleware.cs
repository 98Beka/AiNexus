using Library.Helpers.ApplicationExceptions;
using Library.Helpers.Jwts;
using Microsoft.Extensions.Localization;
using System.Globalization;
using System.Net;
using System.Text.Json;

namespace Library.Helpers.Middlewares;

public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlerMiddleware> _logger;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger, IStringLocalizer<SharedResource> localizer)
    {
        _next = next;
        _logger = logger;
        _localizer = localizer;
    }
    public async Task Invoke(HttpContext context, IJwtUtils jwtUtils)
    {
        try
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            var authentication = jwtUtils.ValidateJwtToken(token);
            if (authentication.Item3 != null)
            {
                var language = authentication.Item3;
                var cultureInfo = new CultureInfo(language);

                Thread.CurrentThread.CurrentCulture = cultureInfo;
                Thread.CurrentThread.CurrentUICulture = cultureInfo;
            }


            context.Items["AccountId"] = authentication.Item1;
            context.Items["AccountRoles"] = authentication.Item2;

            await _next(context);
        }
        catch (Exception error)
        {
            string[] parts = error.Message.Split("|");
            string localizedMessage;

            if (parts.Length > 1)
            {
                string message = parts[0];
                string[] additionalArgs = parts.Skip(1).ToArray();
                localizedMessage = _localizer[message, additionalArgs].Value;
            }
            else
            {
                localizedMessage = _localizer[error.Message].Value;
            }

            var response = context.Response;

            response.ContentType = "application/json";

            switch (error)
            {
                case BadRequestException:
                    // custom application error
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;
                case NotFoundException:
                // custom application error
                case KeyNotFoundException:
                    // not found error
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    break;
                case ForbiddenException:
                    // access denied error
                    response.StatusCode = (int)HttpStatusCode.Forbidden;
                    break;
                case AppException:
                // custom application error
                default:
                    // unhandled error
                    _logger.LogError(error, error.Message);
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            var result = JsonSerializer.Serialize(new { message = localizedMessage });
            await response.WriteAsync(result);
        }
    }
}
