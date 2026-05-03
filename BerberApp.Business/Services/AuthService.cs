using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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
        private readonly IEmailService _emailService;

        public AuthService(AppDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        public ServiceResult<AuthActionResponseDto> Register(RegisterDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var emailExists = _context.Users.Any(x => x.Email == email);

            if (emailExists)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Bu email zaten kayitli.");
            }

            var verificationToken = GenerateToken();
            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User",
                EmailConfirmed = false,
                EmailVerificationTokenHash = BCrypt.Net.BCrypt.HashPassword(verificationToken),
                EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            SendVerificationEmail(user.Email, verificationToken);

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse(
                "Kayit basarili. Giris yapmadan once email adresini dogrula.",
                verificationToken));
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

            if (!user.EmailConfirmed)
            {
                return ServiceResult<LoginResponseDto>.Fail("Email adresi dogrulanmadan giris yapilamaz.");
            }

            var token = CreateToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                EmailConfirmed = user.EmailConfirmed
            };

            return ServiceResult<LoginResponseDto>.Ok(response);
        }

        public ServiceResult<AuthActionResponseDto> VerifyEmail(VerifyEmailDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Kullanici bulunamadi.");
            }

            if (user.EmailConfirmed)
            {
                return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Email zaten dogrulanmis."));
            }

            if (!IsTokenValid(dto.Token, user.EmailVerificationTokenHash, user.EmailVerificationTokenExpiresAt))
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Email dogrulama tokeni gecersiz veya suresi dolmus.");
            }

            user.EmailConfirmed = true;
            user.EmailVerificationTokenHash = null;
            user.EmailVerificationTokenExpiresAt = null;
            _context.SaveChanges();

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Email dogrulandi. Artik giris yapabilirsin."));
        }

        public ServiceResult<AuthActionResponseDto> ResendEmailVerification(ForgotPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Kullanici bulunamadi.");
            }

            if (user.EmailConfirmed)
            {
                return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Email zaten dogrulanmis."));
            }

            var token = GenerateToken();
            user.EmailVerificationTokenHash = BCrypt.Net.BCrypt.HashPassword(token);
            user.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            _context.SaveChanges();

            SendVerificationEmail(user.Email, token);

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Yeni dogrulama maili gonderildi.", token));
        }

        public ServiceResult<AuthActionResponseDto> ForgotPassword(ForgotPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Kullanici bulunamadi.");
            }

            if (!user.EmailConfirmed)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Sifre sifirlamak icin once email adresini dogrulamalisin.");
            }

            var token = GenerateToken();
            user.PasswordResetTokenHash = BCrypt.Net.BCrypt.HashPassword(token);
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
            _context.SaveChanges();

            _emailService.SendEmail(
                user.Email,
                "BerberApp sifre sifirlama",
                $"Sifre sifirlama tokenin: {token}\nBu token 30 dakika gecerlidir.");

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Sifre sifirlama maili gonderildi.", token));
        }

        public ServiceResult<AuthActionResponseDto> ResetPassword(ResetPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Kullanici bulunamadi.");
            }

            if (!IsTokenValid(dto.Token, user.PasswordResetTokenHash, user.PasswordResetTokenExpiresAt))
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Sifre sifirlama tokeni gecersiz veya suresi dolmus.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetTokenHash = null;
            user.PasswordResetTokenExpiresAt = null;
            user.PendingPasswordHash = null;
            user.PasswordChangeTokenHash = null;
            user.PasswordChangeTokenExpiresAt = null;
            _context.SaveChanges();

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Sifre basariyla guncellendi."));
        }

        public ServiceResult<AuthActionResponseDto> RequestPasswordChange(int userId, RequestPasswordChangeDto dto)
        {
            var user = _context.Users.Find(userId);

            if (user == null)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Kullanici bulunamadi.");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Mevcut sifre yanlis.");
            }

            var token = GenerateToken();
            user.PendingPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordChangeTokenHash = BCrypt.Net.BCrypt.HashPassword(token);
            user.PasswordChangeTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
            _context.SaveChanges();

            _emailService.SendEmail(
                user.Email,
                "BerberApp sifre degisikligi onayi",
                $"Sifre degisikligini onaylama tokenin: {token}\nBu token 30 dakika gecerlidir.");

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Sifre degisikligi icin onay maili gonderildi.", token));
        }

        public ServiceResult<AuthActionResponseDto> ConfirmPasswordChange(int userId, ConfirmPasswordChangeDto dto)
        {
            var user = _context.Users.Find(userId);

            if (user == null)
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Kullanici bulunamadi.");
            }

            if (string.IsNullOrWhiteSpace(user.PendingPasswordHash))
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Bekleyen sifre degisikligi bulunamadi.");
            }

            if (!IsTokenValid(dto.Token, user.PasswordChangeTokenHash, user.PasswordChangeTokenExpiresAt))
            {
                return ServiceResult<AuthActionResponseDto>.Fail("Sifre degisikligi tokeni gecersiz veya suresi dolmus.");
            }

            user.PasswordHash = user.PendingPasswordHash;
            user.PendingPasswordHash = null;
            user.PasswordChangeTokenHash = null;
            user.PasswordChangeTokenExpiresAt = null;
            _context.SaveChanges();

            return ServiceResult<AuthActionResponseDto>.Ok(CreateActionResponse("Sifre degisikligi onaylandi."));
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

        private static string GenerateToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        }

        private static bool IsTokenValid(string token, string? tokenHash, DateTime? expiresAt)
        {
            if (string.IsNullOrWhiteSpace(tokenHash) || expiresAt == null || expiresAt < DateTime.UtcNow)
            {
                return false;
            }

            return BCrypt.Net.BCrypt.Verify(token.Trim(), tokenHash);
        }

        private void SendVerificationEmail(string email, string token)
        {
            _emailService.SendEmail(
                email,
                "BerberApp email dogrulama",
                $"Email dogrulama tokenin: {token}\nBu token 24 saat gecerlidir.");
        }

        private AuthActionResponseDto CreateActionResponse(string message, string? developmentToken = null)
        {
            return new AuthActionResponseDto
            {
                Message = message,
                DevelopmentToken = ShouldShowDevelopmentTokens() ? developmentToken : null
            };
        }

        private bool ShouldShowDevelopmentTokens()
        {
            return bool.TryParse(_configuration["Email:ShowDevelopmentTokens"], out var showTokens) && showTokens;
        }
    }
}
