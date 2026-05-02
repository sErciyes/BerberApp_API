using BerberApp.Business.Dtos.AppointmentDtos;
using BerberApp.Business.Results;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace BerberApp.Business.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly AppDbContext _context;

        public AppointmentService(AppDbContext context)
        {
            _context = context;
        }

        public List<AppointmentDto> GetAll()
        {
            return _context.Appointments
                .Include(x => x.User)
                .Include(x => x.Barber)
                .Select(appointment => MapToDto(appointment))
                .ToList();
        }

        public List<AppointmentDto> GetByUserId(int userId)
        {
            return _context.Appointments
                .Include(x => x.User)
                .Include(x => x.Barber)
                .Where(x => x.UserId == userId)
                .Select(appointment => MapToDto(appointment))
                .ToList();
        }

        public AppointmentDto? GetById(int id, int userId, bool isAdmin)
        {
            var appointment = _context.Appointments
                .Include(x => x.User)
                .Include(x => x.Barber)
                .FirstOrDefault(x => x.Id == id);

            if (appointment == null)
            {
                return null;
            }

            if (!isAdmin && appointment.UserId != userId)
            {
                return null;
            }

            return MapToDto(appointment);
        }

        public ServiceResult<AppointmentDto> Create(int userId, CreateAppointmentDto dto)
        {
            var userExists = _context.Users.Any(x => x.Id == userId);
            if (!userExists)
            {
                return ServiceResult<AppointmentDto>.Fail("Kullanici bulunamadi.");
            }

            var barberExists = _context.Barbers.Any(x => x.Id == dto.BarberId);
            if (!barberExists)
            {
                return ServiceResult<AppointmentDto>.Fail("Berber bulunamadi.");
            }

            var appointmentDate = dto.AppointmentDate.Date;
            var appointmentTime = dto.AppointmentTime.Trim();

            if (string.IsNullOrWhiteSpace(appointmentTime))
            {
                return ServiceResult<AppointmentDto>.Fail("Randevu saati bos olamaz.");
            }

            if (appointmentDate < DateTime.Today)
            {
                return ServiceResult<AppointmentDto>.Fail("Gecmis tarihe randevu olusturulamaz.");
            }

            if (!TimeSpan.TryParse(appointmentTime, out var parsedTime))
            {
                return ServiceResult<AppointmentDto>.Fail("Randevu saati HH:mm formatinda olmalidir.");
            }

            var startTime = new TimeSpan(9, 0, 0);
            var endTime = new TimeSpan(18, 0, 0);

            if (parsedTime < startTime || parsedTime >= endTime)
            {
                return ServiceResult<AppointmentDto>.Fail("Randevu saati 09:00 ile 18:00 arasinda olmalidir.");
            }

            if (parsedTime.Minutes != 0 && parsedTime.Minutes != 30)
            {
                return ServiceResult<AppointmentDto>.Fail("Randevu saati sadece 00 veya 30 dakikalarinda olabilir.");
            }

            appointmentTime = parsedTime.ToString(@"hh\:mm");

            var hasConflict = _context.Appointments.Any(x =>
                x.BerberId == dto.BarberId &&
                x.AppointmentDate.Date == appointmentDate &&
                x.ApointmentTime == appointmentTime &&
                x.Status != "Cancelled");

            if (hasConflict)
            {
                return ServiceResult<AppointmentDto>.Fail("Bu berber icin secilen tarih ve saatte zaten randevu var.");
            }

            var appointment = new Appointment
            {
                UserId = userId,
                BerberId = dto.BarberId,
                AppointmentDate = appointmentDate,
                ApointmentTime = appointmentTime,
                Status = "Pending"
            };

            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            var createdAppointment = _context.Appointments
                .Include(x => x.User)
                .Include(x => x.Barber)
                .First(x => x.Id == appointment.Id);

            return ServiceResult<AppointmentDto>.Ok(MapToDto(createdAppointment));
        }

        public ServiceResult<AppointmentDto> UpdateStatus(int id, UpdateAppointmentStatusDto dto)
        {
            var appointment = _context.Appointments
                .Include(x => x.User)
                .Include(x => x.Barber)
                .FirstOrDefault(x => x.Id == id);

            if (appointment == null)
            {
                return ServiceResult<AppointmentDto>.Fail("Randevu bulunamadi.");
            }

            var status = dto.Status.Trim();
            var allowedStatuses = new[] { "Pending", "Approved", "Cancelled", "Completed" };

            if (!allowedStatuses.Contains(status))
            {
                return ServiceResult<AppointmentDto>.Fail("Gecersiz randevu durumu.");
            }

            appointment.Status = status;
            _context.SaveChanges();

            return ServiceResult<AppointmentDto>.Ok(MapToDto(appointment));
        }

        public ServiceResult<string> Delete(int id, int userId, bool isAdmin)
        {
            var appointment = _context.Appointments.Find(id);

            if (appointment == null)
            {
                return ServiceResult<string>.Fail("Randevu bulunamadi.");
            }

            if (!isAdmin && appointment.UserId != userId)
            {
                return ServiceResult<string>.Fail("Bu randevuya erisim yetkiniz yok.");
            }

            if (!isAdmin && appointment.Status != "Pending")
            {
                return ServiceResult<string>.Fail("Sadece Pending durumundaki randevular silinebilir.");
            }

            _context.Appointments.Remove(appointment);
            _context.SaveChanges();

            return ServiceResult<string>.Ok("Randevu silindi.");
        }

        private static AppointmentDto MapToDto(Appointment appointment)
        {
            return new AppointmentDto
            {
                Id = appointment.Id,
                UserId = appointment.UserId,
                UserFullName = appointment.User.FullName,
                BarberId = appointment.BerberId,
                BarberFullName = appointment.Barber.FullName,
                BarberSpecialty = appointment.Barber.Specialty,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.ApointmentTime,
                Status = appointment.Status
            };
        }
    }
}
