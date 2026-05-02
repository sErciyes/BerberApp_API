using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.AppointmentDtos
{
    public class CreateAppointmentDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Gecerli bir berber seciniz.")]
        public int BarberId { get; set; }

        [Required(ErrorMessage = "Randevu tarihi zorunludur.")]
        public DateTime AppointmentDate { get; set; }

        [Required(ErrorMessage = "Randevu saati zorunludur.")]
        [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "Randevu saati HH:mm formatinda olmalidir.")]
        public string AppointmentTime { get; set; } = "";
    }
}
