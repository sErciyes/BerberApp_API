using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.ChatDtos
{
    public class CreateConversationDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Berber secimi zorunludur.")]
        public int BarberId { get; set; }
    }
}
