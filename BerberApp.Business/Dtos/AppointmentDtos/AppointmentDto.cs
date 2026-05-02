namespace BerberApp.Business.Dtos.AppointmentDtos
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = "";
        public int BarberId { get; set; }
        public string BarberFullName { get; set; } = "";
        public string BarberSpecialty { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = "";
        public string Status { get; set; } = "";
    }
}
