using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BerberApp.Business.Dtos.UserDtos;
using BerberApp.Business.Results;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BerberApp.Business.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public ServiceResult<string> Register(RegisterDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var emailExists = _context.Users.Any(x => x.Email == email);

            if (emailExists)
            {
                return ServiceResult<string>.Fail("Bu email zaten kayitli.");
            }

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User"
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return ServiceResult<string>.Ok("Kayit basarili.");
        }

        public ServiceResult<LoginResponseDto> Login(LoginDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null)
            {
                return ServiceResult<LoginResponseDto>.Fail("Kullanici bulunamadi.");
            }

            var isPasswordCorrect = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isPasswordCorrect)
            {
                return ServiceResult<LoginResponseDto>.Fail("Sifre yanlis.");
            }

            var token = CreateToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };

            return ServiceResult<LoginResponseDto>.Ok(response);
        }

        private string CreateToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key appsettings.json icinde bulunamadi.");
            var jwtIssuer = _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt:Issuer appsettings.json icinde bulunamadi.");
            var jwtAudience = _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt:Audience appsettings.json icinde bulunamadi.");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
