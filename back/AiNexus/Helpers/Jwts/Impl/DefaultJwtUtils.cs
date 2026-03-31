using Library.Helpers.Constants;
using Library.Helpers.DbContexts;
using Library.Mappers.Accounts;
using Library.Models;
using Library.Models.Accounts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Library.Helpers.Jwts.Impl
{
    public class DefaultJwtUtils(IOptions<AppSettings> appSettings, IRoleMapper roleMapper, UserManager<Account> userManager, AppPostgreSQLDbContext context) : IJwtUtils
    {
        public string GenerateTestAccessJwt(Applicant applicant) {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(appSettings.Value.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", applicant.Id.ToString()),
                    new Claim("name", applicant.Name),
                    new Claim("surname", applicant.Surname),
                    new Claim("email", applicant.Email),

                }),
                Expires = DateTime.UtcNow.AddMinutes(appSettings.Value.TestTokenTTL),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);

        }
        public string GenerateJwtToken(Account account)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(appSettings.Value.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", account.Id),
                    new Claim("roles", string.Join(",", roleMapper.ToRoles(account))),
                    new Claim("language", account.Settings.Language.ToString()),
                    new Claim("sessionId", account.Sessions.Last().Id.ToString())
                }),
                Expires = DateTime.Now.AddMinutes(appSettings.Value.JwtTokenTTL),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public string GenerateFileJwtToken(long moduleId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(appSettings.Value.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("moduleId", moduleId.ToString()),
                }),
                Expires = DateTime.Now.AddMinutes(appSettings.Value.JwtTokenTTL),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public (string?, List<string>?, string?) ValidateJwtToken(string token)
        {
            if (token is null)
                return (null, null, null);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(appSettings.Value.Secret);
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var accountId = jwtToken.Claims.First(x => x.Type == "id").Value;
                var accountRoles = jwtToken.Claims.First(x => x.Type == "roles").Value.Split(',').ToList();
                var accountLanguage = jwtToken.Claims.First(x => x.Type == "language").Value;
                var sessionId = jwtToken.Claims.First(x => x.Type == "sessionId").Value;
                
                var lastSession = context.Sessions
                    .Where(s => s.AccountId == accountId)
                    .OrderBy(s => s.Id)
                    .Last();

                if(sessionId != lastSession.Id.ToString() || lastSession.LoggedOutAt != null)
                {
                    return (null, null, null);
                }

                // return account id from JWT token if validation successful
                return (accountId, accountRoles, accountLanguage);
            }
            catch
            {
                // return null if validation fails
                return (null, null, null);
            }
        }

        public long? ValidateFileJwtToken(string token)
        {
            if (token is null)
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(appSettings.Value.Secret);
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var moduleId = long.Parse(jwtToken.Claims.First(x => x.Type == "moduleId").Value);

                // return account id from JWT token if validation successful
                return moduleId;
            }
            catch
            {
                // return null if validation fails
                return null;
            }
        }
    }
}
