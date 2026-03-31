using System.Text;
using System.Text.Json;
using AiNexus.Infrastructure.Email;
using AiNexus.Models.Proctoring;
using AutoMapper;
using Library.Helpers.Constants;
using Library.Helpers.DbContexts;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AiNexus.Services.Proctoring.Impl;

public class ProctoringService:IProctoringService
{
    private readonly AppPostgreSQLDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly IMapper _mapper;
    private readonly HttpClient _httpClient;

    public ProctoringService(
        AppPostgreSQLDbContext context,
        IOptions<AppSettings> appSettings,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor, HttpClient httpClient)
    {
        _context = context;
        _appSettings = appSettings.Value;
        _mapper = mapper;
        _httpClient = httpClient;
    } 
    public async Task<ComparisonFacesResponse> ComparisonFacesAsync(PhotoRequest request,string applicantId)
    {
        var applicantGuid = Guid.Parse(applicantId);
        var applicant = await _context.Applicants
            .FirstOrDefaultAsync(a => a.Id == applicantGuid);

        if (applicant == null)
            throw new Exception("Applicant not found");

        if (string.IsNullOrEmpty(applicant.Photo))
            throw new Exception("Original photo is empty");

        if (string.IsNullOrEmpty(request.Photo))
            throw new Exception("Request photo is empty");

        var originalPhoto = CleanBase64(applicant.Photo);
        var photo = CleanBase64(request.Photo);

        // Проверка base64 
        ValidateBase64(originalPhoto, "OriginalPhoto");
        ValidateBase64(photo, "Photo");

        var comparisonFacesRequest = new ComparisonFacesRequest
        {
            OriginalPhoto = originalPhoto,
            Photo = photo
        };

        var json = JsonSerializer.Serialize(comparisonFacesRequest);

        Console.WriteLine("REQUEST JSON:");
        Console.WriteLine(json);

        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            "http://38.180.207.25:8083/api/v1/comparison-faces",
            content
        );

        var responseText = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"RESPONSE: {response.StatusCode}");
        Console.WriteLine(responseText);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"API ERROR: {response.StatusCode} | {responseText}");
        }

        return JsonSerializer.Deserialize<ComparisonFacesResponse>(
            responseText,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        ) ?? new ComparisonFacesResponse();
    }
    private string CleanBase64(string base64)
    {
        if (string.IsNullOrEmpty(base64))
            return base64;

        if (base64.Contains(","))
            return base64.Split(',')[1];

        return base64;
    }

    private void ValidateBase64(string base64, string fieldName)
    {
        try
        {
            Convert.FromBase64String(base64);
        }
        catch
        {
            throw new Exception($"{fieldName} is not valid base64");
        }
    }
}