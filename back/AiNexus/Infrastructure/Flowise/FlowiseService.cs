namespace AiNexus.Infrastructure.Flowise;

using AiNexus.Models.Test;
using MathNet.Numerics.Providers.LinearAlgebra;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

public interface IFlowiseService {
    IAsyncEnumerable<string> StreamMessage(FlowiseRequest flowise_request);
    Task<EvaluationResult> SendMessageAsync(FlowiseRequest flowise_request);
}

public class FlowiseService(
    HttpClient _httpClient,
    IConfiguration _configuration,
    ILogger<FlowiseService> _logger
    ) : IFlowiseService {


    public async Task<EvaluationResult> SendMessageAsync(FlowiseRequest flowise_request) {
        var flowiseUrl = _configuration["Flowise:ApiUrl"];
        var apiKey = _configuration["Flowise:ApiKey"];

        // Инициализируем пустой результат на случай ошибки
        var res = new EvaluationResult();

        if (string.IsNullOrEmpty(flowiseUrl)) {
            throw new InvalidOperationException("Flowise API URL is missing in configuration.");
        }

        var form = new Dictionary<string, object>
        {
            { "message", flowise_request.Message },
            { "agent", flowise_request.Agent }
        };

        var payload = new Dictionary<string, object>
        {
            { "form", form },
            { "chatId", flowise_request.ChatId ?? Guid.NewGuid().ToString() }, // Генерируем новый chatId, если он не предоставлен
            { "streaming", false }
        };

        var request_content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, flowiseUrl);
        request.Content = request_content;

        if (!string.IsNullOrWhiteSpace(apiKey)) {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        }

        using var response = await _httpClient.SendAsync(request, flowise_request.CancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(flowise_request.CancellationToken);

        if (!response.IsSuccessStatusCode) {
            _logger.LogError("Flowise API Error: {StatusCode} - Body: {ErrorBody}", response.StatusCode, responseContent);
            throw new HttpRequestException($"Flowise error ({(int)response.StatusCode}): {responseContent}");
        }

        try {
            // Используем System.Text.Json для парсинга
            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            // 1. Находим массив `agentFlowExecutedData`
            if (root.TryGetProperty("agentFlowExecutedData", out var executedData) && executedData.ValueKind == JsonValueKind.Array) {
                foreach (var node in executedData.EnumerateArray()) {
                    if (node.TryGetProperty("nodeLabel", out var nodeLabel) && nodeLabel.GetString() == "Scoring agent") {
                        if (node.TryGetProperty("data", out var nodeData)) {
                            if (nodeData.TryGetProperty("output", out var output)) {
                                // Извлекаем числовую оценку
                                if (output.TryGetProperty("score", out var scoreElement) && scoreElement.ValueKind == JsonValueKind.Number) {
                                    res.Score = scoreElement.GetInt32(); // Убедитесь, что в EvaluationResult есть свойство Score
                                }

                                // Извлекаем развернутый текст
                                if (output.TryGetProperty("content", out var contentElement) && contentElement.ValueKind == JsonValueKind.String) {
                                    res.Content = contentElement.GetString(); // Убедитесь, что в EvaluationResult есть свойство Content
                                }
                            }

                        }
                        break; // Нужный агент найден, прерываем цикл
                    }
                }
            }

            return res; // Возвращаем заполненный или пустой объект res
        } catch (JsonException ex) {
            _logger.LogWarning(ex, "Failed to parse Flowise response. Returning empty result. Response Body: {ResponseBody}", responseContent);
            return res; // В случае ошибки парсинга возвращаем пустой результат
        } catch (Exception ex) {
            _logger.LogError(ex, "An unexpected error occurred while processing Flowise response.");
            throw; // Перебрасываем неизвестное исключение
        }
    }

    public async IAsyncEnumerable<string> StreamMessage(FlowiseRequest flowise_request) {
        var flowiseUrl = _configuration["Flowise:ApiUrl"];
        var apiKey = _configuration["Flowise:ApiKey"];

        if (string.IsNullOrEmpty(flowiseUrl)) {
            throw new InvalidOperationException("Flowise API URL is missing in configuration.");
        }
        var form = new Dictionary<string, object> {
            { "message", flowise_request.Message },
            { "agent", flowise_request.Agent }
        };

        var payload = new Dictionary<string, object>
        {
            { "form", form },
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