using BerberApp.Business.Dtos.AppointmentDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IAppointmentService
    {
        List<AppointmentDto> GetAll();
        List<AppointmentDto> GetByUserId(int userId);
        List<AppointmentDto> GetByBarberUserId(int userId);
        List<string> GetAvailableSlots(int barberId, DateTime date);
        AppointmentDto? GetById(int id, int userId, bool isAdmin);
        ServiceResult<AppointmentDto> Create(int userId, CreateAppointmentDto dto);
        ServiceResult<AppointmentDto> UpdateStatus(int id, UpdateAppointmentStatusDto dto);
        ServiceResult<string> Delete(int id, int userId, bool isAdmin);
    }
}
