using System.Security.Claims;
using BerberApp.Business.Dtos.ChatDtos;
using BerberApp.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BerberApp.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task JoinConversation(int conversationId)
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();
            var isBarber = IsBarber();

            if (!_chatService.CanAccessConversation(conversationId, userId, isAdmin, isBarber))
            {
                throw new HubException("Bu konusmaya erisim yetkin yok.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(conversationId));
        }

        public async Task<MessageDto> SendMessage(int conversationId, string content)
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();
            var isBarber = IsBarber();
            var result = _chatService.SendMessage(conversationId, userId, isAdmin, isBarber, content);

            if (!result.Success)
            {
                throw new HubException(result.Error ?? "Mesaj gonderilemedi.");
            }

            await Clients.Group(GetGroupName(conversationId)).SendAsync("ReceiveMessage", result.Data);
            return result.Data!;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new HubException("Gecersiz kullanici tokeni.");
            }

            return userId;
        }

        private bool IsAdmin()
        {
            return Context.User?.IsInRole("Admin") == true;
        }

        private bool IsBarber()
        {
            return Context.User?.IsInRole("Barber") == true;
        }

        private static string GetGroupName(int conversationId)
        {
            return $"conversation-{conversationId}";
        }
    }
}
