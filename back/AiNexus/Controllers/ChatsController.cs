using AiNexus.Enums;
using AiNexus.Infrastructure.ChatHistory;
using AiNexus.Infrastructure.Flowise;
using AiNexus.Models.ChatHistory;
using AiNexus.Models.Chats;
using AiNexus.Models.Models;
using AutoMapper;
using Library.Helpers.DbContexts;
using Library.Helpers.Jwts.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace AiNexus.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatsController(
    ILogger<ChatsController> _logger,
    AppPostgreSQLDbContext _context,
    DefaultJwtUtils _jwtUtils,
    IMapper _mapper,
    IFlowiseService _flowiseService,
    IChatHistoryService _chatHistoryService
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


    [Authorize]
    [HttpPost("stream")]
    public async Task StreamChat([FromBody] ChatMessage message, CancellationToken cancellationToken) {
        SetupSseResponse();

        var aiResponseBuilder = new StringBuilder();

        try {
            var userMsg = new HistoryChatMessage("user", message.Content);
            await _chatHistoryService.AddMessageAsync(message.SessionId, userMsg);

            var flowiseRequest = new FlowiseRequest {
                Message = message.Content,
                ChatId = message.SessionId,
                CancellationToken = cancellationToken,
                Agent = AgentNameEnum.user_facing_agent.ToString()
            };

            var stream = _flowiseService.StreamMessage(flowiseRequest);
            await ProcessStreamAsync(stream, aiResponseBuilder, cancellationToken);

        } catch (OperationCanceledException) {
            _logger.LogInformation("Client disconnected during chat stream.");
        } catch (Exception ex) {
            _logger.LogError(ex, "Error during agent execution stream");
            var errorData = JsonSerializer.Serialize(new { error = "An error occurred during chat generation." });
            await Response.WriteAsync($"data: {errorData}\n\n");
            await Response.Body.FlushAsync();
        } finally {
            if (aiResponseBuilder.Length > 0) {
                var aiMsg = new HistoryChatMessage("assistant", aiResponseBuilder.ToString());
                await _chatHistoryService.AddMessageAsync(message.SessionId, aiMsg);
            }
        }
    }

    private void SetupSseResponse() {
        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
    }

    private async Task ProcessStreamAsync(IAsyncEnumerable<string> stream, StringBuilder aiResponseBuilder, CancellationToken cancellationToken) {
        var hasChunks = false;

        await foreach (var chunk in stream) {
            hasChunks = true;
            aiResponseBuilder.Append(chunk);

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
}