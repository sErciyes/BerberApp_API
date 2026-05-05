using BerberApp.Business.Dtos.ShopDtos;
using BerberApp.Business.Results;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace BerberApp.Business.Services
{
    public class ShopService : IShopService
    {
        private readonly AppDbContext _context;

        public ShopService(AppDbContext context)
        {
            _context = context;
        }

        public List<ShopDto> GetAll()
        {
            return _context.Shops
                .Include(x => x.OwnerUser)
                .Include(x => x.Barbers)
                .OrderBy(x => x.Name)
                .Select(x => MapToDto(x, null))
                .ToList();
        }

        public List<ShopDto> GetNearby(double latitude, double longitude, double radiusKm)
        {
            var safeRadiusKm = radiusKm <= 0 ? 10 : Math.Min(radiusKm, 100);

            return _context.Shops
                .Include(x => x.OwnerUser)
                .Include(x => x.Barbers)
                .AsEnumerable()
                .Select(shop =>
                {
                    var distanceKm = CalculateDistanceKm(latitude, longitude, shop.Latitude, shop.Longitude);
                    return MapToDto(shop, distanceKm);
                })
                .Where(shop => shop.DistanceKm <= safeRadiusKm)
                .OrderBy(shop => shop.DistanceKm)
                .ToList();
        }

        public ShopDto? GetById(int id)
        {
            var shop = _context.Shops
                .Include(x => x.OwnerUser)
                .Include(x => x.Barbers)
                .FirstOrDefault(x => x.Id == id);

            return shop == null ? null : MapToDto(shop, null);
        }

        public ServiceResult<ShopDto> Add(CreateShopDto dto)
        {
            var ownerResult = ValidateOwner(dto.OwnerUserId);

            if (!ownerResult.Success)
            {
                return ServiceResult<ShopDto>.Fail(ownerResult.Error!);
            }

            var shop = new Shop
            {
                Name = dto.Name.Trim(),
                Address = dto.Address.Trim(),
                City = dto.City.Trim(),
                District = dto.District.Trim(),
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                OwnerUserId = dto.OwnerUserId
            };

            _context.Shops.Add(shop);
            _context.SaveChanges();

            return ServiceResult<ShopDto>.Ok(GetById(shop.Id)!);
        }

        public ServiceResult<ShopDto> Update(int id, UpdateShopDto dto)
        {
            var shop = _context.Shops.Find(id);

            if (shop == null)
            {
                return ServiceResult<ShopDto>.Fail("Dukkan bulunamadi.");
            }

            var ownerResult = ValidateOwner(dto.OwnerUserId);

            if (!ownerResult.Success)
            {
                return ServiceResult<ShopDto>.Fail(ownerResult.Error!);
            }

            shop.Name = dto.Name.Trim();
            shop.Address = dto.Address.Trim();
            shop.City = dto.City.Trim();
            shop.District = dto.District.Trim();
            shop.Latitude = dto.Latitude;
            shop.Longitude = dto.Longitude;
            shop.OwnerUserId = dto.OwnerUserId;

            _context.SaveChanges();

            return ServiceResult<ShopDto>.Ok(GetById(shop.Id)!);
        }

        public bool Delete(int id)
        {
            var shop = _context.Shops.Find(id);

            if (shop == null)
            {
                return false;
            }

            _context.Shops.Remove(shop);
            _context.SaveChanges();

            return true;
        }

        private ServiceResult<bool> ValidateOwner(int? ownerUserId)
        {
            if (ownerUserId == null)
            {
                return ServiceResult<bool>.Ok(true);
            }

            var owner = _context.Users.Find(ownerUserId);

            if (owner == null)
            {
                return ServiceResult<bool>.Fail("Dukkan yoneticisi bulunamadi.");
            }

            if (owner.Role != "ShopAdmin" && owner.Role != "Admin")
            {
                return ServiceResult<bool>.Fail("Dukkan yoneticisi rolu ShopAdmin veya Admin olmalidir.");
            }

            return ServiceResult<bool>.Ok(true);
        }

        private static ShopDto MapToDto(Shop shop, double? distanceKm)
        {
            return new ShopDto
            {
                Id = shop.Id,
                Name = shop.Name,
                Address = shop.Address,
                City = shop.City,
                District = shop.District,
                Latitude = shop.Latitude,
                Longitude = shop.Longitude,
                OwnerUserId = shop.OwnerUserId,
                OwnerFullName = shop.OwnerUser?.FullName ?? "",
                BarberCount = shop.Barbers.Count,
                DistanceKm = distanceKm == null ? null : Math.Round(distanceKm.Value, 2)
            };
        }

        private static double CalculateDistanceKm(double sourceLatitude, double sourceLongitude, double targetLatitude, double targetLongitude)
        {
            const double earthRadiusKm = 6371;
            var latitudeDistance = ToRadians(targetLatitude - sourceLatitude);
            var longitudeDistance = ToRadians(targetLongitude - sourceLongitude);

            var a =
                Math.Sin(latitudeDistance / 2) * Math.Sin(latitudeDistance / 2) +
                Math.Cos(ToRadians(sourceLatitude)) * Math.Cos(ToRadians(targetLatitude)) *
                Math.Sin(longitudeDistance / 2) * Math.Sin(longitudeDistance / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return earthRadiusKm * c;
        }

        private static double ToRadians(double degree)
        {
            return degree * Math.PI / 180;
        }
    }
}
