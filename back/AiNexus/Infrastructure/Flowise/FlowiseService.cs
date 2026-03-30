namespace AiNexus.Infrastructure.Flowise;

using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

public interface IFlowiseService {
    IAsyncEnumerable<string> StreamMessage(FlowiseRequest flowise_request);
}

public class FlowiseService(
    HttpClient _httpClient,
    IConfiguration _configuration,
    ILogger<FlowiseService> _logger
    ) : IFlowiseService {

    public async IAsyncEnumerable<string> StreamMessage(FlowiseRequest flowise_request) {
        var flowiseUrl = _configuration["Flowise:ApiUrl"];
        var apiKey = _configuration["Flowise:ApiKey"];

        if (string.IsNullOrEmpty(flowiseUrl)) {
            throw new InvalidOperationException("Flowise API URL is missing in configuration.");
        }

        var payload = new Dictionary<string, object>
        {
            { "question", flowise_request.Message },
            { "chatId", flowise_request.ChatId },
            { "streaming", true }
        };

        var options = new JsonSerializerOptions {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            WriteIndented = true
        };

        Console.WriteLine("Flowise Payload: " + JsonSerializer.Serialize(payload, options));

        var request_content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, flowiseUrl);
        request.Content = request_content;

        if (!string.IsNullOrWhiteSpace(apiKey)) {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        }

        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, flowise_request.CancellationToken);

        // ВАЖНОЕ ИЗМЕНЕНИЕ: Читаем текст ошибки, если запрос упал
        if (!response.IsSuccessStatusCode) {
            var errorContent = await response.Content.ReadAsStringAsync(flowise_request.CancellationToken);
            _logger.LogError("Flowise API Error: {StatusCode} - Body: {ErrorBody}", response.StatusCode, errorContent);

            // Выбрасываем понятную ошибку, чтобы на фронтенд не ушел мусор
            throw new HttpRequestException($"Flowise error ({(int)response.StatusCode}): {errorContent}");
        }

        using var responseStream = await response.Content.ReadAsStreamAsync(flowise_request.CancellationToken);
        using var reader = new StreamReader(responseStream);

        // ВАЖНОЕ ИЗМЕНЕНИЕ: Бесконечный цикл, выход по null
        while (true) {
            flowise_request.CancellationToken.ThrowIfCancellationRequested();

            var line = await reader.ReadLineAsync(flowise_request.CancellationToken);

            // Если line == null, значит сервер закрыл соединение (поток завершен)
            if (line == null)
                break;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            if (line.StartsWith("data:")) {
                var dataPayload = line.Substring(5).Trim();

                if (dataPayload == "[DONE]")
                    break;

                string? chunkToYield = null;
                bool hasFlowiseError = false;
                string? errorMessage = null;

                try {
                    // Обрабатываем JSON-события от Agentflow (V2)
                    if (dataPayload.StartsWith("{") && dataPayload.EndsWith("}")) {
                        using var doc = JsonDocument.Parse(dataPayload);
                        var root = doc.RootElement;

                        if (root.TryGetProperty("event", out var eventElement)) {
                            var eventName = eventElement.GetString();

                            if (eventName == "token" && root.TryGetProperty("data", out var dataElement)) {
                                chunkToYield = dataElement.GetString() ?? "";
                            } else if (eventName == "error" && root.TryGetProperty("data", out var errorElement)) {
                                hasFlowiseError = true;
                                errorMessage = errorElement.GetString();
                            }
                        }
                    }
                    // Фолбэк для обычных Chatflows (V1)
                    else if (dataPayload.StartsWith("\"") && dataPayload.EndsWith("\"")) {
                        chunkToYield = JsonSerializer.Deserialize<string>(dataPayload);
                    }
                    // Если это просто текст
                    else {
                        chunkToYield = dataPayload;
                    }
                } catch (JsonException ex) {
                    _logger.LogWarning(ex, "Failed to parse JSON from Flowise stream: {Payload}", dataPayload);
                }

                if (hasFlowiseError) {
                    throw new Exception($"Flowise Stream Error: {errorMessage}");
                }

                if (chunkToYield != null) {
                    yield return chunkToYield;
                }
            }
        }
    }
}