using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.UserDtos
{
    public class UpdateUserRoleDto
    {
        [Required(ErrorMessage = "Rol zorunludur.")]
        public string Role { get; set; } = "";
    }
}
