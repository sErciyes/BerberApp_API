namespace BerberApp.Business.Dtos.UserDtos
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = "";
        public int UserId { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string ProfileImageUrl { get; set; } = "";
        public string Role { get; set; } = "";
        public bool EmailConfirmed { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
    }
}
