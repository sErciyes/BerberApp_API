namespace BerberApp.Business.Dtos.BarberDtos
{
    public class BarberDto
    {
        public int Id { get; set; }
        public int? ShopId { get; set; }
        public string ShopName { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Specialty { get; set; } = "";
    }
}
