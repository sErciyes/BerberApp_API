using BerberApp.Business.Dtos.UserDtos;
using BerberApp.Business.Results;

namespace BerberApp.Business.Services
{
    public interface IUserService
    {
        List<UserDto> GetAll();
        UserDto? GetById(int id);
        ServiceResult<UserDto> UpdateRole(int id, UpdateUserRoleDto dto);
    }
}
