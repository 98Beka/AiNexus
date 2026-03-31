using System.Text.Json.Serialization;

namespace AiNexus.Models.Proctoring;

public class ComparisonFacesRequest
{
    [JsonPropertyName("original_photo")]
    public string OriginalPhoto { get; set; }

    [JsonPropertyName("photo")]
    public string Photo { get; set; }

    [JsonPropertyName("fullname")]
    public string Fullname { get; set; }

    [JsonPropertyName("pin")]
    public string Pin { get; set; }
}