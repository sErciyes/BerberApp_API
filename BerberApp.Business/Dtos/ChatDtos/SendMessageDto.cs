using System.ComponentModel.DataAnnotations;

namespace BerberApp.Business.Dtos.ChatDtos
{
    public class SendMessageDto
    {
        [Required(ErrorMessage = "Mesaj zorunludur.")]
        [MaxLength(1000, ErrorMessage = "Mesaj en fazla 1000 karakter olabilir.")]
        public string Content { get; set; } = "";
    }
}
