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
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public IActionResult GetMe()
        {
            var userId = GetCurrentUserId();
            var user = _userService.GetById(userId);

            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Kullanici bulunamadi."));
            }

            return Ok(ApiResponse<object>.Ok(user));
        }

        [HttpPut("me")]
        public IActionResult UpdateMe(UpdateProfileDto dto)
        {
            var userId = GetCurrentUserId();
            var result = _userService.UpdateProfile(userId, dto);

            if (!result.Success)
            {
                if (result.Error == "Kullanici bulunamadi.")
                {
                    return NotFound(ApiResponse<object>.Fail(result.Error));
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Profil guncellenemedi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Profil guncellendi."));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(ApiResponse<object>.Ok(users));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var user = _userService.GetById(id);

            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Kullanici bulunamadi."));
            }

            return Ok(ApiResponse<object>.Ok(user));
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/role")]
        public IActionResult UpdateRole(int id, UpdateUserRoleDto dto)
        {
            var result = _userService.UpdateRole(id, dto);

            if (!result.Success)
            {
                if (result.Error == "Kullanici bulunamadi.")
                {
                    return NotFound(ApiResponse<object>.Fail(result.Error));
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Rol guncellenemedi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Kullanici rolu guncellendi."));
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
