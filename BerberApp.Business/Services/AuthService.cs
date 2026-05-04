using System.IdentityModel.Tokens.Jwt;
using System.Net;
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
                CreateEmailHtml(
                    "Sifreni yenile",
                    "BerberApp hesabinin sifresini yenilemek icin asagidaki butona tikla.",
                    "Sifreyi Yenile",
                    CreateFrontendLink("/forgot-password", user.Email, token),
                    "Bu link 30 dakika gecerlidir."),
                isHtml: true);

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
                CreateEmailHtml(
                    "Sifre degisikligini onayla",
                    "BerberApp hesabinda sifre degisikligi baslatildi. Onaylamak icin asagidaki butona tikla.",
                    "Degisikligi Onayla",
                    CreateFrontendLink("/profile", user.Email, token, "passwordChangeToken"),
                    "Bu link 30 dakika gecerlidir."),
                isHtml: true);

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
                CreateEmailHtml(
                    "Email adresini dogrula",
                    "BerberApp hesabini kullanmaya baslamak icin email adresini dogrula.",
                    "Emaili Dogrula",
                    CreateFrontendLink("/verify-email", email, token),
                    "Bu link 24 saat gecerlidir."),
                isHtml: true);
        }

        private string CreateFrontendLink(string path, string email, string token, string tokenParameterName = "token")
        {
            var frontendBaseUrl = (_configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var encodedEmail = WebUtility.UrlEncode(email);
            var encodedToken = WebUtility.UrlEncode(token);

            return $"{frontendBaseUrl}{path}?email={encodedEmail}&{tokenParameterName}={encodedToken}";
        }

        private static string CreateEmailHtml(string title, string description, string buttonText, string actionUrl, string footerText)
        {
            return $"""
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{WebUtility.HtmlEncode(title)}</title>
</head>
<body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#132033;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d7deea;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0b1220;padding:22px 26px;color:#f8fafc;">
              <div style="font-size:13px;color:#38bdf8;font-weight:700;letter-spacing:.4px;">BerberApp</div>
              <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">{WebUtility.HtmlEncode(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:26px;">
              <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#334155;">{WebUtility.HtmlEncode(description)}</p>
              <a href="{WebUtility.HtmlEncode(actionUrl)}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:8px;">{WebUtility.HtmlEncode(buttonText)}</a>
              <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b;">Buton calismazsa bu linki tarayicinda acabilirsin:</p>
              <p style="margin:8px 0 0;font-size:12px;line-height:1.5;word-break:break-all;color:#0f172a;">{WebUtility.HtmlEncode(actionUrl)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 26px;background:#f8fafc;border-top:1px solid #d7deea;color:#64748b;font-size:12px;line-height:1.6;">
              {WebUtility.HtmlEncode(footerText)} Bu istegi sen yapmadiysan bu maili yok sayabilirsin.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""";
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
