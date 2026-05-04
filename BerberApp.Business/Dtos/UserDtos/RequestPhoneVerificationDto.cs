using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class RequestPhoneVerificationDto
    {
        [Required(ErrorMessage = "Telefon numarasi zorunludur.")]
        [MaxLength(20, ErrorMessage = "Telefon numarasi en fazla 20 karakter olabilir.")]
        public string PhoneNumber { get; set; } = "";
    }
}
