using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class RequestPasswordChangeDto
    {
        [Required(ErrorMessage = "Mevcut sifre zorunludur.")]
        public string CurrentPassword { get; set; } = "";

        [Required(ErrorMessage = "Yeni sifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Yeni sifre en az 6 karakter olmalidir.")]
        public string NewPassword { get; set; } = "";
    }
}
