using System.Security.Claims;
using BerberApp.API.Models;
using BerberApp.Business.Dtos.ChatDtos;
using BerberApp.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BerberApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ConversationsController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ConversationsController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet]
        public IActionResult GetConversations()
        {
            var conversations = _chatService.GetConversations(GetCurrentUserId(), User.IsInRole("Admin"));
            return Ok(ApiResponse<object>.Ok(conversations));
        }

        [HttpPost]
        public IActionResult CreateConversation(CreateConversationDto dto)
        {
            var result = _chatService.CreateOrGetConversation(GetCurrentUserId(), dto.BarberId);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Konusma olusturulamadi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Konusma hazir."));
        }

        [HttpGet("{id}/messages")]
        public IActionResult GetMessages(int id)
        {
            var result = _chatService.GetMessages(id, GetCurrentUserId(), User.IsInRole("Admin"));

            if (!result.Success)
            {
                return Forbid();
            }

            return Ok(ApiResponse<object>.Ok(result.Data!));
        }

        [HttpPost("{id}/messages")]
        public IActionResult SendMessage(int id, SendMessageDto dto)
        {
            var result = _chatService.SendMessage(id, GetCurrentUserId(), User.IsInRole("Admin"), dto.Content);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<object>.Fail(result.Error ?? "Mesaj gonderilemedi."));
            }

            return Ok(ApiResponse<object>.Ok(result.Data!, "Mesaj gonderildi."));
        }

        [HttpPatch("{id}/read")]
        public IActionResult MarkAsRead(int id)
        {
            var result = _chatService.MarkAsRead(id, GetCurrentUserId(), User.IsInRole("Admin"));

            if (!result.Success)
            {
                return Forbid();
            }

            return Ok(ApiResponse<object>.Ok(true, "Mesajlar okundu."));
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Gecersiz kullanici tokeni.");
            }

            return userId;
        }
    }
}
