using System.Net;
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
        private readonly IEmailService _emailService;

        public AppointmentService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
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
                .OrderBy(x => x.AppointmentDate)
                .ThenBy(x => x.ApointmentTime)
                .Select(appointment => MapToDto(appointment))
                .ToList();
        }

        public List<AppointmentDto> GetByBarberUserId(int userId)
        {
            return _context.Appointments
                .Include(x => x.User)
                .Include(x => x.Barber)
                .Where(x => x.Barber.UserId == userId)
                .OrderBy(x => x.AppointmentDate)
                .ThenBy(x => x.ApointmentTime)
                .Select(appointment => MapToDto(appointment))
                .ToList();
        }

        public List<string> GetAvailableSlots(int barberId, DateTime date)
        {
            var appointmentDate = date.Date;
            var slotTimes = new List<string>();
            var businessNow = GetBusinessNow();
            var businessToday = businessNow.Date;

            if (!_context.Barbers.Any(x => x.Id == barberId))
            {
                return slotTimes;
            }

            if (appointmentDate < businessToday)
            {
                return slotTimes;
            }

            var bookedSlots = _context.Appointments
                .Where(x =>
                    x.BerberId == barberId &&
                    x.AppointmentDate.Date == appointmentDate &&
                    x.Status != "Cancelled")
                .Select(x => x.ApointmentTime)
                .ToHashSet();

            var nowTime = businessNow.TimeOfDay;

            for (var hour = 9; hour < 18; hour++)
            {
                foreach (var minute in new[] { 0, 30 })
                {
                    var slot = new TimeSpan(hour, minute, 0);

                    if (slot >= new TimeSpan(18, 0, 0))
                    {
                        continue;
                    }

                    if (appointmentDate == businessToday && slot <= nowTime)
                    {
                        continue;
                    }

                    var slotText = slot.ToString(@"hh\:mm");

                    if (!bookedSlots.Contains(slotText))
                    {
                        slotTimes.Add(slotText);
                    }
                }
            }

            return slotTimes;
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
            var user = _context.Users.FirstOrDefault(x => x.Id == userId);
            if (user == null)
            {
                return ServiceResult<AppointmentDto>.Fail("Kullanici bulunamadi.");
            }

            var barber = _context.Barbers
                .Include(x => x.User)
                .FirstOrDefault(x => x.Id == dto.BarberId);

            if (barber == null)
            {
                return ServiceResult<AppointmentDto>.Fail("Berber bulunamadi.");
            }

            var hasActiveAppointment = _context.Appointments.Any(x =>
                x.UserId == userId &&
                (x.Status == "Pending" || x.Status == "Approved") &&
                x.AppointmentDate.Date >= GetBusinessToday());

            if (hasActiveAppointment)
            {
                return ServiceResult<AppointmentDto>.Fail("Aktif bir randevun oldugu icin yeni randevu alamazsin.");
            }

            var appointmentDate = dto.AppointmentDate.Date;
            var appointmentTime = dto.AppointmentTime.Trim();
            var businessNow = GetBusinessNow();
            var businessToday = businessNow.Date;

            if (string.IsNullOrWhiteSpace(appointmentTime))
            {
                return ServiceResult<AppointmentDto>.Fail("Randevu saati bos olamaz.");
            }

            if (appointmentDate < businessToday)
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

            if (appointmentDate == businessToday && parsedTime <= businessNow.TimeOfDay)
            {
                return ServiceResult<AppointmentDto>.Fail("Bugun icin gecmis saate randevu olusturulamaz.");
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
                .ThenInclude(x => x.User)
                .Include(x => x.Barber)
                .ThenInclude(x => x.Shop)
                .First(x => x.Id == appointment.Id);

            _ = Task.Run(() => SendAppointmentSummaryEmails(createdAppointment));

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

        private static DateTime GetBusinessToday()
        {
            return GetBusinessNow().Date;
        }

        private static DateTime GetBusinessNow()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, GetBusinessTimeZone());
        }

        private static TimeZoneInfo GetBusinessTimeZone()
        {
            foreach (var timeZoneId in new[] { "Europe/Istanbul", "Turkey Standard Time" })
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                }
                catch (TimeZoneNotFoundException)
                {
                }
                catch (InvalidTimeZoneException)
                {
                }
            }

            return TimeZoneInfo.Local;
        }

        private void SendAppointmentSummaryEmails(Appointment appointment)
        {
            var appointmentDateText = appointment.AppointmentDate.ToString("dd.MM.yyyy");
            var shopName = appointment.Barber.Shop?.Name ?? "BerberApp";

            var userHtml = CreateAppointmentEmailHtml(
                "Randevun olusturuldu",
                $"{appointment.User.FullName}, randevun basariyla kaydedildi.",
                appointment.Barber.FullName,
                appointment.Barber.Specialty,
                appointmentDateText,
                appointment.ApointmentTime,
                appointment.Status,
                shopName,
                "Randevuna gelmeden once uygulama icinden detaylarini kontrol edebilirsin.");

            _emailService.SendEmail(
                appointment.User.Email,
                "BerberApp randevu ozeti",
                userHtml,
                isHtml: true);

            var barberEmail = appointment.Barber.User?.Email;

            if (!string.IsNullOrWhiteSpace(barberEmail))
            {
                var barberHtml = CreateAppointmentEmailHtml(
                    "Yeni randevu alindi",
                    $"{appointment.Barber.FullName}, yeni bir musteri randevusu olustu.",
                    appointment.User.FullName,
                    appointment.Barber.Specialty,
                    appointmentDateText,
                    appointment.ApointmentTime,
                    appointment.Status,
                    shopName,
                    "Musteri bilgisi olarak bu ozeti referans alabilirsin.");

                _emailService.SendEmail(
                    barberEmail,
                    "BerberApp yeni randevu bildirimi",
                    barberHtml,
                    isHtml: true);
            }
        }

        private static string CreateAppointmentEmailHtml(
            string title,
            string description,
            string primaryName,
            string specialty,
            string appointmentDate,
            string appointmentTime,
            string status,
            string shopName,
            string footerText)
        {
            return $"""
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{WebUtility.HtmlEncode(title)}</title>
</head>
<body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#132033;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d7deea;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0b1220;padding:22px 26px;color:#f8fafc;">
              <div style="font-size:13px;color:#38bdf8;font-weight:700;letter-spacing:.4px;">BerberApp</div>
              <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">{WebUtility.HtmlEncode(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:26px;">
              <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#334155;">{WebUtility.HtmlEncode(description)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border:1px solid #d7deea;border-radius:10px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;">Kisi</div>
                    <div style="font-size:16px;font-weight:800;color:#0f172a;">{WebUtility.HtmlEncode(primaryName)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border:1px solid #d7deea;border-radius:10px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;">Hizmet</div>
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">{WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(specialty) ? "Genel hizmet" : specialty)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border:1px solid #d7deea;border-radius:10px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;">Tarih ve saat</div>
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">{WebUtility.HtmlEncode(appointmentDate)} - {WebUtility.HtmlEncode(appointmentTime)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border:1px solid #d7deea;border-radius:10px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;">Durum</div>
                    <div style="display:inline-block;background:#e6f4ff;color:#075985;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;">{WebUtility.HtmlEncode(status)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border:1px solid #d7deea;border-radius:10px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;">Dukkan</div>
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">{WebUtility.HtmlEncode(shopName)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 26px;background:#f8fafc;border-top:1px solid #d7deea;color:#64748b;font-size:12px;line-height:1.6;">
              {WebUtility.HtmlEncode(footerText)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""";
        }
    }
}
