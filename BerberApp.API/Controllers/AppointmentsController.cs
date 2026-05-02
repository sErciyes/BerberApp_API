using System.Security.Claims;
using BerberApp.API.Models;
using BerberApp.Business.Dtos.AppointmentDtos;
using BerberApp.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BerberApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult GetAll()
        {
            var appointments = _appointmentService.GetAll();
            return Ok(ApiResponse<object>.Ok(appointments));
        }

        [HttpGet("my")]
        public IActionResult GetMyAppointments()
        {
            var userId = GetCurrentUserId();
            var appointments = _appointmentService.GetByUserId(userId);

            return Ok(ApiResponse<object>.Ok(appointments));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var appointment = _appointmentService.GetById(id, userId, isAdmin);

            if (appointment == null)
            {
                return NotFound(ApiResponse<object>.Fail("Randevu bulunamadi."));
            }

            return Ok(ApiResponse<object>.Ok(appointment));
        }

        [HttpPost]
        public IActionResult Create(CreateAppointmentDto dto)
        {
            var userId = GetCurrentUserId();
            var result = _appointmentService.Create(userId, dto);

            if (!result.Success)
            {
                if (result.Error == "Bu berber icin secilen tarih ve saatte zaten randevu var.")
                {
                    return Conflict(ApiResponse<object>.Fail(result.Error));
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Randevu olusturulamadi."));
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                ApiResponse<object>.Ok(result.Data, "Randevu olusturuldu."));
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public IActionResult UpdateStatus(int id, UpdateAppointmentStatusDto dto)
        {
            var result = _appointmentService.UpdateStatus(id, dto);

            if (!result.Success)
            {
                if (result.Error == "Randevu bulunamadi.")
                {
                    return NotFound(ApiResponse<object>.Fail(result.Error));
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Randevu guncellenemedi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Randevu durumu guncellendi."));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var result = _appointmentService.Delete(id, userId, isAdmin);

            if (!result.Success)
            {
                if (result.Error == "Randevu bulunamadi.")
                {
                    return NotFound(ApiResponse<object>.Fail(result.Error));
                }

                if (result.Error == "Bu randevuya erisim yetkiniz yok.")
                {
                    return Forbid();
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Randevu silinemedi."));
            }

            return NoContent();
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
