namespace BerberApp.Entities.Concrete
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;
        public int SenderUserId { get; set; }
        public User SenderUser { get; set; } = null!;
        public string Content { get; set; } = "";
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
