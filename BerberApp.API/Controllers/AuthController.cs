using System.Security.Claims;
using BerberApp.API.Models;
using BerberApp.Business.Dtos.UserDtos;
using BerberApp.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BerberApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            var result = _authService.Register(dto);
            return ToActionResult(result, "Kayit basarili.");
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var result = _authService.Login(dto);
            return ToActionResult(result, "Giris basarili.");
        }

        [HttpPost("verify-email")]
        public IActionResult VerifyEmail(VerifyEmailDto dto)
        {
            var result = _authService.VerifyEmail(dto);
            return ToActionResult(result, "Email dogrulandi.");
        }

        [HttpPost("resend-email-verification")]
        public IActionResult ResendEmailVerification(ForgotPasswordDto dto)
        {
            var result = _authService.ResendEmailVerification(dto);
            return ToActionResult(result, "Dogrulama maili gonderildi.");
        }

        [HttpPost("request-phone-verification")]
        public IActionResult RequestPhoneVerification(RequestPhoneVerificationDto dto)
        {
            var result = _authService.RequestPhoneVerification(dto);
            return ToActionResult(result, "Telefon dogrulama kodu gonderildi.");
        }

        [HttpPost("verify-phone")]
        public IActionResult VerifyPhone(VerifyPhoneDto dto)
        {
            var result = _authService.VerifyPhone(dto);
            return ToActionResult(result, "Telefon numarasi dogrulandi.");
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword(ForgotPasswordDto dto)
        {
            var result = _authService.ForgotPassword(dto);
            return ToActionResult(result, "Sifre sifirlama maili gonderildi.");
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword(ResetPasswordDto dto)
        {
            var result = _authService.ResetPassword(dto);
            return ToActionResult(result, "Sifre guncellendi.");
        }

        [Authorize]
        [HttpPost("request-password-change")]
        public IActionResult RequestPasswordChange(RequestPasswordChangeDto dto)
        {
            var result = _authService.RequestPasswordChange(GetCurrentUserId(), dto);
            return ToActionResult(result, "Sifre degisikligi icin onay maili gonderildi.");
        }

        [Authorize]
        [HttpPost("confirm-password-change")]
        public IActionResult ConfirmPasswordChange(ConfirmPasswordChangeDto dto)
        {
            var result = _authService.ConfirmPasswordChange(GetCurrentUserId(), dto);
            return ToActionResult(result, "Sifre degisikligi onaylandi.");
        }

        private IActionResult ToActionResult<T>(BerberApp.Business.Results.ServiceResult<T> result, string successMessage)
        {
            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Islem basarisiz."));
            }

            return Ok(ApiResponse<T>.Ok(result.Data!, successMessage));
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Gecersiz kullanici tokeni.");
            }

            return userId;
        }
    }
}
