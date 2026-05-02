using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BerberApp.Entities.Concrete
{
    public class Appointment
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int BerberId { get; set; }
        public Barber Barber { get; set; } = null!;

        public DateTime AppointmentDate { get; set; }
        public string ApointmentTime { get; set; } = "";
        public string Status { get; set; } = "Pending";
    }
}
