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
            var result = _barberService.Add(dto);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Berber olusturulamadi."));
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                ApiResponse<object>.Ok(result.Data!, "Berber olusturuldu."));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Update(int id, UpdateBarberDto dto)
        {
            var result = _barberService.Update(id, dto);

            if (!result.Success)
            {
                if (result.Error == "Berber bulunamadi.")
                {
                    return NotFound(ApiResponse<object>.Fail(result.Error));
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Berber guncellenemedi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Berber guncellendi."));
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
