using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class VerifyPhoneDto
    {
        [Required(ErrorMessage = "Telefon numarasi zorunludur.")]
        [MaxLength(20, ErrorMessage = "Telefon numarasi en fazla 20 karakter olabilir.")]
        public string PhoneNumber { get; set; } = "";

        [Required(ErrorMessage = "Kod zorunludur.")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Kod 6 haneli olmalidir.")]
        public string Code { get; set; } = "";
    }
}
