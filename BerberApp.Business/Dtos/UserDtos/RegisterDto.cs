using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Ad soyad zorunludur.")]
        [MaxLength(50, ErrorMessage = "Ad soyad en fazla 50 karakter olabilir.")]
        public string FullName { get; set; } = "";

        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Gecerli bir email adresi giriniz.")]
        [MaxLength(150, ErrorMessage = "Email en fazla 150 karakter olabilir.")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Sifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Sifre en az 6 karakter olmalidir.")]
        public string Password { get; set; } = "";
    }
}
