using BerberApp.API.Models;
using BerberApp.Business.Dtos.ShopDtos;
using BerberApp.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BerberApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShopsController : ControllerBase
    {
        private readonly IShopService _shopService;

        public ShopsController(IShopService shopService)
        {
            _shopService = shopService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var shops = _shopService.GetAll();
            return Ok(ApiResponse<object>.Ok(shops));
        }

        [HttpGet("nearby")]
        public IActionResult GetNearby([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radiusKm = 10)
        {
            var shops = _shopService.GetNearby(latitude, longitude, radiusKm);
            return Ok(ApiResponse<object>.Ok(shops));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var shop = _shopService.GetById(id);

            if (shop == null)
            {
                return NotFound(ApiResponse<object>.Fail("Dukkan bulunamadi."));
            }

            return Ok(ApiResponse<object>.Ok(shop));
        }

        [Authorize(Roles = "Admin,ShopAdmin")]
        [HttpPost]
        public IActionResult Add(CreateShopDto dto)
        {
            var result = _shopService.Add(dto);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Dukkan olusturulamadi."));
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                ApiResponse<object>.Ok(result.Data!, "Dukkan olusturuldu."));
        }

        [Authorize(Roles = "Admin,ShopAdmin")]
        [HttpPut("{id}")]
        public IActionResult Update(int id, UpdateShopDto dto)
        {
            var result = _shopService.Update(id, dto);

            if (!result.Success)
            {
                if (result.Error == "Dukkan bulunamadi.")
                {
                    return NotFound(ApiResponse<object>.Fail(result.Error));
                }

                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Dukkan guncellenemedi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Dukkan guncellendi."));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _shopService.Delete(id);

            if (!result)
            {
                return NotFound(ApiResponse<object>.Fail("Dukkan bulunamadi."));
            }

            return NoContent();
        }
    }
}
