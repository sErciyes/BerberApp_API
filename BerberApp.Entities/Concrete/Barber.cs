using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BerberApp.Entities.Concrete
{
    public class Barber
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; }
        public int? ShopId { get; set; }
        public Shop? Shop { get; set; }
        public string FullName { get; set; } = "";
        public string Specialty { get; set; } = "";
        [JsonIgnore]
        public List<Appointment> Appointments { get; set; } = new();

        [JsonIgnore]
        public List<Conversation> Conversations { get; set; } = new();

    }
}
