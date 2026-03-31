
using System.Globalization;
using System.Text;
using System.Text.Json.Serialization;
using AiNexus.Constants;
using AiNexus.Infrastructure.Email;
using AiNexus.Infrastructure.Flowise;
using AiNexus.Services.Applicants;
using AiNexus.Services.Applicants.Impl;
using AiNexus.Services.Proctoring;
using AiNexus.Services.Proctoring.Impl;
using Library.Helpers.Constants;
using Library.Helpers.Constants.Accounts;
using Library.Helpers.DbContexts;
using Library.Helpers.Jwts;
using Library.Helpers.Jwts.Impl;
using Library.Helpers.Middlewares;
using Library.Mappers.Accounts;
using Library.Mappers.Accounts.Impl;
using Library.Models.Accounts;
using Library.Services.Accounts;
using Library.Services.Accounts.Impl;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.Configure<DefaultAdminCridensial>(builder.Configuration.GetSection("DefaultAdminCridensials"));
builder.Services.AddHttpClient();

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Secret"]))
    };
});

builder.Services.AddDbContext<AppPostgreSQLDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddIdentityCore<Account>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddRoles<Library.Models.Accounts.Role>()
    .AddEntityFrameworkStores<AppPostgreSQLDbContext>();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddScoped<IRoleMapper, DefaultRoleMapper>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IJwtUtils, DefaultJwtUtils>();
builder.Services.AddScoped<IAccountService, DefaultAccountService>();
builder.Services.AddHttpClient<IFlowiseService, FlowiseService>();
builder.Services.AddScoped<DefaultJwtUtils, DefaultJwtUtils>();
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<EmailApiSettings>(
    builder.Configuration.GetSection("EmailApi"));

builder.Services.AddHttpClient<IEmailService, EmailSender>((sp, client) =>
{
    var settings = sp.GetRequiredService<IOptions<EmailApiSettings>>().Value;
    client.BaseAddress = new Uri(settings.BaseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<IApplicantService, ApplicantService>();
builder.Services.AddScoped<IProctoringService, ProctoringService>();


builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AiNexus  API",
        Version = "v1",
        Description = "Пример запроса:\n```json\n{\n  \"email\": \"admin@gmail.com\",\n  \"password\": \"_Aa123456\"\n}\n```"
    });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddLocalization(options =>
{
    options.ResourcesPath = "Resources";
});
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo("ru"),
        new CultureInfo("ky")
    };

    options.DefaultRequestCulture = new RequestCulture("ru");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
});

builder.Services.AddCors();

builder.WebHost.ConfigureKestrel(options => {
    options.ListenAnyIP(8080); // HTTP only
});

var app = builder.Build();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppPostgreSQLDbContext>();

        context.Database.Migrate();

        var defaultAdminCridensial = services.GetRequiredService<IOptions<DefaultAdminCridensial>>().Value;
        var userManager = services.GetRequiredService<UserManager<Account>>();
        var rolesManager = services.GetRequiredService<RoleManager<Library.Models.Accounts.Role>>();
        await DefaultInitializer.InitializeAsync(defaultAdminCridensial, userManager, rolesManager, context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
});
// global error handler
app.UseMiddleware<ErrorHandlerMiddleware>();

// global cors policy
app.UseCors(x => x
    .SetIsOriginAllowed(origin => true)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()
);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRequestLocalization();

app.UseAuthentication();
app.UseAuthorization();



app.MapControllers();

app.Run();