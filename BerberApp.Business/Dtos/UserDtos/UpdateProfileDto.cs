using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Ad soyad zorunludur.")]
        [MaxLength(50, ErrorMessage = "Ad soyad en fazla 50 karakter olabilir.")]
        public string FullName { get; set; } = "";

        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Gecerli bir email adresi giriniz.")]
        [MaxLength(150, ErrorMessage = "Email en fazla 150 karakter olabilir.")]
        public string Email { get; set; } = "";
    }
}
