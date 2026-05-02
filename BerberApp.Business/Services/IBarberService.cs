using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BerberApp.Business.Dtos.BarberDtos;

namespace BerberApp.Business.Services
{
    public interface IBarberService
    {
        List<BarberDto> GetAll();
        BarberDto? GetById(int id);
        BarberDto Add(CreateBarberDto dto);
        BarberDto? Update(int id,UpdateBarberDto dto);
        bool Delete(int id);
    }
}
