using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class VerifyEmailDto
    {
        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Gecerli bir email adresi giriniz.")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Token zorunludur.")]
        public string Token { get; set; } = "";
    }
}
