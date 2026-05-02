using BerberApp.API.Models;
using BerberApp.Business.Dtos.BarberDtos;
using BerberApp.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BerberApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BarbersController : ControllerBase
    {
        private readonly IBarberService _barberService;

        public BarbersController(IBarberService barberService)
        {
            _barberService = barberService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var barbers = _barberService.GetAll();
            return Ok(ApiResponse<object>.Ok(barbers));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var barber = _barberService.GetById(id);

            if (barber == null)
            {
                return NotFound(ApiResponse<object>.Fail("Berber bulunamadi."));
            }

            return Ok(ApiResponse<object>.Ok(barber));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public IActionResult Add(CreateBarberDto dto)
        {
            var createdBarber = _barberService.Add(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdBarber.Id },
                ApiResponse<object>.Ok(createdBarber, "Berber olusturuldu."));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Update(int id, UpdateBarberDto dto)
        {
            var updatedBarber = _barberService.Update(id, dto);

            if (updatedBarber == null)
            {
                return NotFound(ApiResponse<object>.Fail("Berber bulunamadi."));
            }

            return Ok(ApiResponse<object>.Ok(updatedBarber, "Berber guncellendi."));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _barberService.Delete(id);

            if (!result)
            {
                return NotFound(ApiResponse<object>.Fail("Berber bulunamadi."));
            }

            return NoContent();
        }
    }
}
