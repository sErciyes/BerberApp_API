using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.AppointmentDtos
{
    public class UpdateAppointmentStatusDto
    {
        [Required(ErrorMessage = "Randevu durumu zorunludur.")]
        public string Status { get; set; } = "";
    }
}
