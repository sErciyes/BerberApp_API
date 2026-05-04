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

        public ServiceResult<UserDto> UpdateProfile(int id, UpdateProfileDto dto)
        {
            var user = _context.Users.Find(id);

            if (user == null)
            {
                return ServiceResult<UserDto>.Fail("Kullanici bulunamadi.");
            }

            var email = dto.Email.Trim().ToLower();
            var phoneNumber = NormalizePhoneNumber(dto.PhoneNumber);
            var emailExists = _context.Users.Any(x => x.Id != id && x.Email == email);

            if (emailExists)
            {
                return ServiceResult<UserDto>.Fail("Bu email baska bir kullanici tarafindan kullaniliyor.");
            }

            var phoneExists = _context.Users.Any(x => x.Id != id && x.PhoneNumber == phoneNumber);

            if (phoneExists)
            {
                return ServiceResult<UserDto>.Fail("Bu telefon numarasi baska bir kullanici tarafindan kullaniliyor.");
            }

            if (user.PhoneNumber != phoneNumber)
            {
                user.PhoneNumberConfirmed = false;
                user.PhoneVerificationCodeHash = null;
                user.PhoneVerificationCodeExpiresAt = null;
            }

            user.FullName = dto.FullName.Trim();
            user.Email = email;
            user.PhoneNumber = phoneNumber;

            _context.SaveChanges();

            return ServiceResult<UserDto>.Ok(MapToDto(user));
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
                PhoneNumber = user.PhoneNumber ?? "",
                Role = user.Role,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed
            };
        }

        private static string NormalizePhoneNumber(string phoneNumber)
        {
            var clean = phoneNumber
                .Trim()
                .Replace(" ", "")
                .Replace("(", "")
                .Replace(")", "")
                .Replace("-", "");

            if (clean.StartsWith("00"))
            {
                clean = "+" + clean[2..];
            }
            else if (clean.StartsWith("0"))
            {
                clean = "+90" + clean[1..];
            }
            else if (!clean.StartsWith("+"))
            {
                clean = "+90" + clean;
            }

            return clean;
        }
    }
}
