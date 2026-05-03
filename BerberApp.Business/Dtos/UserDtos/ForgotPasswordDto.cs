using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Gecerli bir email adresi giriniz.")]
        public string Email { get; set; } = "";
    }
}
