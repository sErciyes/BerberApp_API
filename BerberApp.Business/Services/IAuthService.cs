using BerberApp.Business.Dtos.UserDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IAuthService
    {
        ServiceResult<AuthActionResponseDto> Register(RegisterDto dto);
        ServiceResult<LoginResponseDto> Login(LoginDto dto);
        ServiceResult<AuthActionResponseDto> VerifyEmail(VerifyEmailDto dto);
        ServiceResult<AuthActionResponseDto> ResendEmailVerification(ForgotPasswordDto dto);
        ServiceResult<AuthActionResponseDto> RequestPhoneVerification(RequestPhoneVerificationDto dto);
        ServiceResult<AuthActionResponseDto> VerifyPhone(VerifyPhoneDto dto);
        ServiceResult<AuthActionResponseDto> ForgotPassword(ForgotPasswordDto dto);
        ServiceResult<AuthActionResponseDto> ResetPassword(ResetPasswordDto dto);
        ServiceResult<AuthActionResponseDto> RequestPasswordChange(int userId, RequestPasswordChangeDto dto);
        ServiceResult<AuthActionResponseDto> ConfirmPasswordChange(int userId, ConfirmPasswordChangeDto dto);
    }
}
