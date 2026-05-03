using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Gecerli bir email adresi giriniz.")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Token zorunludur.")]
        public string Token { get; set; } = "";

        [Required(ErrorMessage = "Yeni sifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Yeni sifre en az 6 karakter olmalidir.")]
        public string NewPassword { get; set; } = "";
    }
}
