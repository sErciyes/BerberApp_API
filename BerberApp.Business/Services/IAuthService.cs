using BerberApp.Business.Dtos.UserDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IAuthService
    {
        ServiceResult<string> Register(RegisterDto dto);
        ServiceResult<LoginResponseDto> Login(LoginDto dto);
    }
}
