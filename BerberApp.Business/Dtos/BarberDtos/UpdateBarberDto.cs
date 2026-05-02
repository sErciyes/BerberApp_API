using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.BarberDtos
{
    public class UpdateBarberDto
    {
        [Required(ErrorMessage = "Berber adi zorunludur.")]
        [MaxLength(100, ErrorMessage = "Berber adi en fazla 100 karakter olabilir.")]
        public string FullName { get; set; } = "";

        [MaxLength(100, ErrorMessage = "Uzmanlik en fazla 100 karakter olabilir.")]
        public string Specialty { get; set; } = "";
    }
}
