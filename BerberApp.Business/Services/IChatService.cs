using BerberApp.Business.Dtos.ChatDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IChatService
    {
        ServiceResult<ConversationDto> CreateOrGetConversation(int userId, int barberId);
        List<ConversationDto> GetConversations(int userId, bool isAdmin);
        ServiceResult<List<MessageDto>> GetMessages(int conversationId, int userId, bool isAdmin);
        ServiceResult<MessageDto> SendMessage(int conversationId, int senderUserId, bool isAdmin, string content);
        ServiceResult<bool> MarkAsRead(int conversationId, int userId, bool isAdmin);
        bool CanAccessConversation(int conversationId, int userId, bool isAdmin);
    }
}
