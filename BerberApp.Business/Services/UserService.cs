using BerberApp.Business.Dtos.UserDtos;
using BerberApp.Business.Results;
using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;

namespace BerberApp.Business.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public List<UserDto> GetAll()
        {
            return _context.Users
                .Select(user => MapToDto(user))
                .ToList();
        }

        public UserDto? GetById(int id)
        {
            var user = _context.Users.Find(id);

            return user == null ? null : MapToDto(user);
        }

        public ServiceResult<UserDto> UpdateRole(int id, UpdateUserRoleDto dto)
        {
            var user = _context.Users.Find(id);

            if (user == null)
            {
                return ServiceResult<UserDto>.Fail("Kullanici bulunamadi.");
            }

            var role = dto.Role.Trim();
            var allowedRoles = new[] { "User", "Admin" };

            if (!allowedRoles.Contains(role))
            {
                return ServiceResult<UserDto>.Fail("Rol sadece User veya Admin olabilir.");
            }

            user.Role = role;
            _context.SaveChanges();

            return ServiceResult<UserDto>.Ok(MapToDto(user));
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
