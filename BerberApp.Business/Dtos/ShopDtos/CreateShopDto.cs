using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.ShopDtos
{
    public class CreateShopDto
    {
        [Required(ErrorMessage = "Dukkan adi zorunludur.")]
        [MaxLength(120, ErrorMessage = "Dukkan adi en fazla 120 karakter olabilir.")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Adres zorunludur.")]
        [MaxLength(300, ErrorMessage = "Adres en fazla 300 karakter olabilir.")]
        public string Address { get; set; } = "";

        [Required(ErrorMessage = "Sehir zorunludur.")]
        [MaxLength(80, ErrorMessage = "Sehir en fazla 80 karakter olabilir.")]
        public string City { get; set; } = "";

        [Required(ErrorMessage = "Ilce zorunludur.")]
        [MaxLength(80, ErrorMessage = "Ilce en fazla 80 karakter olabilir.")]
        public string District { get; set; } = "";

        [Range(-90, 90, ErrorMessage = "Latitude -90 ile 90 arasinda olmalidir.")]
        public double Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude -180 ile 180 arasinda olmalidir.")]
        public double Longitude { get; set; }

        public int? OwnerUserId { get; set; }
    }
}
