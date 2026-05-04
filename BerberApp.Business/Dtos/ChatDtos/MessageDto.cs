namespace BerberApp.Business.Dtos.ChatDtos
{
    public class MessageDto
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public int SenderUserId { get; set; }
        public string SenderFullName { get; set; } = "";
        public string Content { get; set; } = "";
        public bool IsMine { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
