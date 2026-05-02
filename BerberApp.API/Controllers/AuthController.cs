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

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Kayit basarisiz."));
            }

            return Ok(ApiResponse<string>.Ok(result.Data!, "Kayit basarili."));
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var result = _authService.Login(dto);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Giris basarisiz."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Giris basarili."));
        }

        [Authorize]
        [HttpGet("secret")]
        public IActionResult Secret()
        {
            return Ok(ApiResponse<string>.Ok("Bu korumali alan"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-secret")]
        public IActionResult AdminSecret()
        {
            return Ok(ApiResponse<string>.Ok("Bu alan sadece admin kullanicilar icindir"));
        }
    }
}
