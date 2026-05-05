namespace BerberApp.Business.Dtos.ShopDtos
{
    public class ShopDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public string City { get; set; } = "";
        public string District { get; set; } = "";
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int? OwnerUserId { get; set; }
        public string OwnerFullName { get; set; } = "";
        public int BarberCount { get; set; }
        public double? DistanceKm { get; set; }
    }
}
