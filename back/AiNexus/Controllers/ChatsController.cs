using AiNexus.Infrastructure.Flowise;
using AiNexus.Models;
using AiNexus.Models.Chats;
using AiNexus.Models.Models;
using AutoMapper;
using Library.Helpers.DbContexts;
using Library.Helpers.Jwts.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AiNexus.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChatsController(
    ILogger<ChatsController> _logger,
    AppPostgreSQLDbContext _context,
    DefaultJwtUtils _jwtUtils,
    IMapper _mapper,
    IFlowiseService _flowiseService
    ) : ControllerBase {
    [AllowAnonymous]
    [HttpGet("access_token/{testToken}")]
    public async Task<IActionResult> GetAccessToken(string testToken) {
        var aplicant = await _context.Applicants.Where(a => a.TemporaryToken == testToken).FirstOrDefaultAsync();
        if (aplicant == null)
            return NotFound();
        if (aplicant.TemporaryTokenExpiresAt < DateTime.UtcNow)
            return BadRequest("Test token has expired.");
        var accessToken = _jwtUtils.GenerateTestAccessJwt(aplicant);
        return Ok(accessToken);
    }

    [HttpPost("stream")]
    public async Task StreamChat([FromBody] ChatMessage message, CancellationToken cancellationToken) {
        SetupSseResponse();

        var userId = GetUserId();
        try {
            var hasChunks = false;
            var flowiseRequest = new FlowiseRequest {
                Message = message.Content,
                ChatId = message.SessionId,
                CancellationToken = cancellationToken
            };

            var stream = _flowiseService.StreamMessageAsync(flowiseRequest);

            await ProcessStreamAsync(stream, cancellationToken);

        } catch (OperationCanceledException) {
            _logger.LogInformation("Client {UserId} disconnected during chat stream.", userId);
        } catch (Exception ex) {
            _logger.LogError(ex, "Error during agent execution stream");
            var errorData = JsonSerializer.Serialize(new { error = "An error occurred during chat generation." });
            await Response.WriteAsync($"data: {errorData}\n\n");
            await Response.Body.FlushAsync();
        }
    }


    private void SetupSseResponse() {
        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
    }

    private string GetUserId() {
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
             ?? User.FindFirst("sub")?.Value
             ?? "unknown_user";
    }

    private async Task ProcessStreamAsync(IAsyncEnumerable<string> stream, CancellationToken cancellationToken) {
        var hasChunks = false;

        await foreach (var chunk in stream) {
            hasChunks = true;
            var data = JsonSerializer.Serialize(new ChatStreamChunk(chunk, false));
            await Response.WriteAsync($"data: {data}\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }

        if (!hasChunks) {
            _logger.LogWarning("No chunks received from FlowiseService");
        }

        var completeData = JsonSerializer.Serialize(new ChatStreamChunk("", true));
        await Response.WriteAsync($"data: {completeData}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private async Task SendErrorAsync(string errorMessage, CancellationToken cancellationToken) {
        var errorData = JsonSerializer.Serialize(new { error = errorMessage });
        await Response.WriteAsync($"data: {errorData}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}