using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Gecerli bir email adresi giriniz.")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Sifre zorunludur.")]
        public string Password { get; set; } = "";
    }
}
