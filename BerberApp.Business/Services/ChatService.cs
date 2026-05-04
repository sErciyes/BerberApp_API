using BerberApp.Business.Dtos.ChatDtos;
using BerberApp.Business.Results;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace BerberApp.Business.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;

        public ChatService(AppDbContext context)
        {
            _context = context;
        }

        public ServiceResult<ConversationDto> CreateOrGetConversation(int userId, int barberId)
        {
            var userExists = _context.Users.Any(x => x.Id == userId);
            var barberExists = _context.Barbers.Any(x => x.Id == barberId);

            if (!userExists || !barberExists)
            {
                return ServiceResult<ConversationDto>.Fail("Kullanici veya berber bulunamadi.");
            }

            var conversation = _context.Conversations
                .Include(x => x.User)
                .Include(x => x.Barber)
                .Include(x => x.Messages)
                .FirstOrDefault(x => x.UserId == userId && x.BarberId == barberId);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    UserId = userId,
                    BarberId = barberId,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                _context.Conversations.Add(conversation);
                _context.SaveChanges();

                conversation = _context.Conversations
                    .Include(x => x.User)
                    .Include(x => x.Barber)
                    .Include(x => x.Messages)
                    .First(x => x.Id == conversation.Id);
            }

            return ServiceResult<ConversationDto>.Ok(MapConversation(conversation, userId, false));
        }

        public List<ConversationDto> GetConversations(int userId, bool isAdmin)
        {
            var query = _context.Conversations
                .Include(x => x.User)
                .Include(x => x.Barber)
                .Include(x => x.Messages)
                .AsQueryable();

            if (!isAdmin)
            {
                query = query.Where(x => x.UserId == userId);
            }

            return query
                .OrderByDescending(x => x.LastMessageAt)
                .Select(x => MapConversation(x, userId, isAdmin))
                .ToList();
        }

        public ServiceResult<List<MessageDto>> GetMessages(int conversationId, int userId, bool isAdmin)
        {
            if (!CanAccessConversation(conversationId, userId, isAdmin))
            {
                return ServiceResult<List<MessageDto>>.Fail("Bu konusmaya erisim yetkin yok.");
            }

            var messages = _context.ChatMessages
                .Include(x => x.SenderUser)
                .Where(x => x.ConversationId == conversationId)
                .OrderBy(x => x.CreatedAt)
                .Select(x => MapMessage(x, userId))
                .ToList();

            return ServiceResult<List<MessageDto>>.Ok(messages);
        }

        public ServiceResult<MessageDto> SendMessage(int conversationId, int senderUserId, bool isAdmin, string content)
        {
            content = content.Trim();

            if (string.IsNullOrWhiteSpace(content))
            {
                return ServiceResult<MessageDto>.Fail("Mesaj bos olamaz.");
            }

            if (content.Length > 1000)
            {
                return ServiceResult<MessageDto>.Fail("Mesaj en fazla 1000 karakter olabilir.");
            }

            var conversation = _context.Conversations.FirstOrDefault(x => x.Id == conversationId);

            if (conversation == null)
            {
                return ServiceResult<MessageDto>.Fail("Konusma bulunamadi.");
            }

            if (!isAdmin && conversation.UserId != senderUserId)
            {
                return ServiceResult<MessageDto>.Fail("Bu konusmaya mesaj gonderme yetkin yok.");
            }

            var message = new ChatMessage
            {
                ConversationId = conversationId,
                SenderUserId = senderUserId,
                Content = content,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            conversation.LastMessageAt = message.CreatedAt;

            _context.ChatMessages.Add(message);
            _context.SaveChanges();

            message = _context.ChatMessages
                .Include(x => x.SenderUser)
                .First(x => x.Id == message.Id);

            return ServiceResult<MessageDto>.Ok(MapMessage(message, senderUserId));
        }

        public ServiceResult<bool> MarkAsRead(int conversationId, int userId, bool isAdmin)
        {
            if (!CanAccessConversation(conversationId, userId, isAdmin))
            {
                return ServiceResult<bool>.Fail("Bu konusmaya erisim yetkin yok.");
            }

            var unreadMessages = _context.ChatMessages
                .Where(x => x.ConversationId == conversationId && x.SenderUserId != userId && !x.IsRead)
                .ToList();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            _context.SaveChanges();

            return ServiceResult<bool>.Ok(true);
        }

        public bool CanAccessConversation(int conversationId, int userId, bool isAdmin)
        {
            return _context.Conversations.Any(x => x.Id == conversationId && (isAdmin || x.UserId == userId));
        }

        private static ConversationDto MapConversation(Conversation conversation, int currentUserId, bool isAdmin)
        {
            var lastMessage = conversation.Messages
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefault();

            return new ConversationDto
            {
                Id = conversation.Id,
                UserId = conversation.UserId,
                UserFullName = conversation.User.FullName,
                BarberId = conversation.BarberId,
                BarberFullName = conversation.Barber.FullName,
                BarberSpecialty = conversation.Barber.Specialty,
                CreatedAt = conversation.CreatedAt,
                LastMessageAt = conversation.LastMessageAt,
                LastMessage = lastMessage?.Content ?? "",
                UnreadCount = conversation.Messages.Count(x => !x.IsRead && x.SenderUserId != currentUserId)
            };
        }

        private static MessageDto MapMessage(ChatMessage message, int currentUserId)
        {
            return new MessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderUserId = message.SenderUserId,
                SenderFullName = message.SenderUser.FullName,
                Content = message.Content,
                IsRead = message.IsRead,
                IsMine = message.SenderUserId == currentUserId,
                CreatedAt = message.CreatedAt
            };
        }
    }
}
