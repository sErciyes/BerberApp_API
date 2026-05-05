using BerberApp.Business.Dtos.ShopDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IShopService
    {
        List<ShopDto> GetAll();
        List<ShopDto> GetNearby(double latitude, double longitude, double radiusKm);
        ShopDto? GetById(int id);
        ServiceResult<ShopDto> Add(CreateShopDto dto);
        ServiceResult<ShopDto> Update(int id, UpdateShopDto dto);
        bool Delete(int id);
    }
}
