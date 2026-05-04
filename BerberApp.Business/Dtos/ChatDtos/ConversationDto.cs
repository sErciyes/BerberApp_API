namespace BerberApp.Business.Dtos.ChatDtos
{
    public class ConversationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = "";
        public int BarberId { get; set; }
        public string BarberFullName { get; set; } = "";
        public string BarberSpecialty { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
        public string LastMessage { get; set; } = "";
        public int UnreadCount { get; set; }
    }
}
