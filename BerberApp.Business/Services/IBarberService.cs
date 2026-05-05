using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BerberApp.Business.Dtos.BarberDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IBarberService
    {
        List<BarberDto> GetAll();
        BarberDto? GetById(int id);
        ServiceResult<BarberDto> Add(CreateBarberDto dto);
        ServiceResult<BarberDto> Update(int id,UpdateBarberDto dto);
        bool Delete(int id);
    }
}
