using System.Text.Json.Serialization;

namespace BerberApp.Entities.Concrete
{
    public class Shop
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public string City { get; set; } = "";
        public string District { get; set; } = "";
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int? OwnerUserId { get; set; }
        public User? OwnerUser { get; set; }

        [JsonIgnore]
        public List<Barber> Barbers { get; set; } = new();
    }
}
