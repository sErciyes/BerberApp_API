using System.Text.Json.Serialization;

namespace BerberApp.Entities.Concrete
{
    public class Conversation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int BarberId { get; set; }
        public Barber Barber { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public List<ChatMessage> Messages { get; set; } = new();
    }
}
