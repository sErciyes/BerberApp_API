using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BerberApp.Business.Dtos.BarberDtos;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;

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
                .Select(barber => new BarberDto
                {
                    Id = barber.Id,
                    FullName = barber.FullName,
                    Specialty = barber.Specialty
                })
                .ToList();
        }
        public BarberDto? GetById(int id)
        {
            var barber = _context.Barbers.Find(id);

            return barber == null ? null : MapToDto(barber);
        }
        public BarberDto Add(CreateBarberDto dto)
        {
            var barber = new Barber
            {
                FullName=dto.FullName,
                Specialty=dto.Specialty
            };

            _context.Barbers.Add(barber);
            _context.SaveChanges();

            return MapToDto(barber);
        }
        public BarberDto? Update(int id, UpdateBarberDto dto)
        {
            var barber = _context.Barbers.Find(id);
            if (barber==null)
            {
                return null;
            }
            else
            {
                barber.FullName=dto.FullName;
                barber.Specialty=dto.Specialty;

                _context.SaveChanges();
                return MapToDto(barber);
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
                FullName = barber.FullName,
                Specialty = barber.Specialty
            };
        }
    }
}
