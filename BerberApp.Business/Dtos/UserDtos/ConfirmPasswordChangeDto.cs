using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class ConfirmPasswordChangeDto
    {
        [Required(ErrorMessage = "Token zorunludur.")]
        public string Token { get; set; } = "";
    }
}
