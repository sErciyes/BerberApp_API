using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BerberApp.Business.Dtos.BarberDtos;
using BerberApp.Business.Results;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace BerberApp.Business.Services
{
    public class BarberService : IBarberService
    {
        private readonly AppDbContext _context;
        public BarberService(AppDbContext context)
        {
            _context=context;
        }
        public List<BarberDto> GetAll()
        {
            return _context.Barbers
                .Include(x => x.Shop)
                .Select(barber => new BarberDto
                {
                    Id = barber.Id,
                    ShopId = barber.ShopId,
                    ShopName = barber.Shop == null ? "" : barber.Shop.Name,
                    FullName = barber.FullName,
                    Specialty = barber.Specialty,
                    ProfileImageUrl = barber.ProfileImageUrl ?? ""
                })
                .ToList();
        }
        public BarberDto? GetById(int id)
        {
            var barber = _context.Barbers
                .Include(x => x.Shop)
                .FirstOrDefault(x => x.Id == id);

            return barber == null ? null : MapToDto(barber);
        }

        public List<BarberDto> GetByShopId(int shopId)
        {
            return _context.Barbers
                .Where(x => x.ShopId == shopId)
                .Include(x => x.Shop)
                .Select(barber => new BarberDto
                {
                    Id = barber.Id,
                    ShopId = barber.ShopId,
                    ShopName = barber.Shop == null ? "" : barber.Shop.Name,
                    FullName = barber.FullName,
                    Specialty = barber.Specialty,
                    ProfileImageUrl = barber.ProfileImageUrl ?? ""
                })
                .ToList();
        }

        public ServiceResult<BarberDto> Add(CreateBarberDto dto)
        {
            if (!ShopExists(dto.ShopId))
            {
                return ServiceResult<BarberDto>.Fail("Dukkan bulunamadi.");
            }

            var barber = new Barber
            {
                FullName=dto.FullName,
                Specialty=dto.Specialty,
                ShopId = dto.ShopId,
                ProfileImageUrl = dto.ProfileImageUrl.Trim()
            };

            _context.Barbers.Add(barber);
            _context.SaveChanges();

            return ServiceResult<BarberDto>.Ok(GetById(barber.Id)!);
        }
        public ServiceResult<BarberDto> Update(int id, UpdateBarberDto dto)
        {
            var barber = _context.Barbers.Find(id);
            if (barber==null)
            {
                return ServiceResult<BarberDto>.Fail("Berber bulunamadi.");
            }
            else
            {
                if (!ShopExists(dto.ShopId))
                {
                    return ServiceResult<BarberDto>.Fail("Dukkan bulunamadi.");
                }

                barber.FullName=dto.FullName;
                barber.Specialty=dto.Specialty;
                barber.ShopId=dto.ShopId;
                barber.ProfileImageUrl = dto.ProfileImageUrl.Trim();

                _context.SaveChanges();
                return ServiceResult<BarberDto>.Ok(GetById(barber.Id)!);
            }
        }
        public bool Delete (int id)
        {
            var barber = _context.Barbers.Find(id);

            if (barber==null)
                return false;
            else
            {
                _context.Barbers.Remove(barber);
                _context.SaveChanges();

                return true;
            }
        }

        private static BarberDto MapToDto(Barber barber)
        {
            return new BarberDto
            {
                Id = barber.Id,
                ShopId = barber.ShopId,
                ShopName = barber.Shop?.Name ?? "",
                FullName = barber.FullName,
                Specialty = barber.Specialty,
                ProfileImageUrl = barber.ProfileImageUrl ?? ""
            };
        }

        private bool ShopExists(int? shopId)
        {
            return shopId == null || _context.Shops.Any(x => x.Id == shopId);
        }
    }
}
