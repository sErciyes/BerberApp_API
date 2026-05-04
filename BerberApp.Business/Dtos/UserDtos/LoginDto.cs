using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email veya telefon zorunludur.")]
        public string EmailOrPhone { get; set; } = "";

        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Sifre zorunludur.")]
        public string Password { get; set; } = "";
    }
}
