using System.Text.Json.Serialization;

namespace AiNexus.Models.Proctoring;

public class ComparisonFacesResponse
{
    [JsonPropertyName("same_person")]
    public bool SamePerson { get; set; } = false;

    [JsonPropertyName("num_faces_on_photo")]
    public int NumFacesOnPhoto { get; set; } = 0;

    [JsonPropertyName("message")]
    public string Message { get; set; } = "";
}