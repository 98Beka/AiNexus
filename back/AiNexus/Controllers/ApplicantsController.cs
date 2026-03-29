using AutoMapper;
using Library.Dtos.Applicants;
using Library.Helpers.Constants;
using Library.Models;
using Library.Models.Accounts;
using Library.Helpers.DbContexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Library.Controllers
{
    [Route(AppRoutes.Base + "applicants")]
    [ApiController]
    public class ApplicantsController : ControllerBase
    {
        private readonly AppPostgreSQLDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<ApplicantsController> _logger;

        public ApplicantsController(AppPostgreSQLDbContext db, IMapper mapper, ILogger<ApplicantsController> logger)
        {
            _db = db;
            _mapper = mapper;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("submit")]
        public async Task<ActionResult<ApplicantDto>> Submit([FromBody] CreateApplicantRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var exists = await _db.Applicants.AnyAsync(x => x.Email == request.Email);
            if (exists)
            {
                return Conflict("Заявитель с таким Email уже существует.");
            }

            var applicant = new Applicant
            {
                Name = request.Name,
                Surname = request.Surname,
                Patronymic = request.Patronymic,
                Email = request.Email,
                Phone = request.Phone,
                Status = "Submitted",
                TemporaryToken = Guid.NewGuid().ToString("N"),
                TemporaryTokenExpiresAt = DateTime.UtcNow.AddHours(24),
            };

            _db.Applicants.Add(applicant);
            await _db.SaveChangesAsync();

            var temporaryLink = $"{Request.Scheme}://{Request.Host}/applicant-test/{applicant.TemporaryToken}";

            _logger.LogInformation("Сгенерирована временная ссылка для заявителя {Email}: {Link}", applicant.Email, temporaryLink);

            // TODO: интегрировать реальную отправку email

            var result = _mapper.Map<ApplicantDto>(applicant);
            return CreatedAtAction(nameof(Get), new { id = applicant.Id }, result);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<ApplicantDto>>> List()
        {
            var list = await _db.Applicants
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
            return _mapper.Map<List<ApplicantDto>>(list);
        }

        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApplicantDto>> Get(Guid id)
        {
            var applicant = await _db.Applicants.FindAsync(id);
            if (applicant == null)
                return NotFound();
            return _mapper.Map<ApplicantDto>(applicant);
        }

        [AllowAnonymous]
        [HttpGet("token/{token}")]
        public async Task<ActionResult<ApplicantDto>> GetByToken(string token)
        {
            var applicant = await _db.Applicants.FirstOrDefaultAsync(a => a.TemporaryToken == token);
            if (applicant == null || applicant.TemporaryTokenExpiresAt < DateTime.UtcNow)
                return NotFound("Token not found or expired");

            return _mapper.Map<ApplicantDto>(applicant);
        }

        [Authorize]
        [HttpPut("{id:guid}/test-result")]
        public async Task<ActionResult<ApplicantDto>> UpdateTest(Guid id, [FromBody] TestResultRequest request)
        {
            var applicant = await _db.Applicants.FindAsync(id);
            if (applicant == null)
                return NotFound();

            applicant.Score = request.Score;
            applicant.TestResultDetails = request.TestResultDetails;
            applicant.Status = "Tested";
            applicant.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var result = _mapper.Map<ApplicantDto>(applicant);
            return Ok(result);
        }
    }
}
