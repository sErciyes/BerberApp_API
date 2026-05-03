using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BerberApp.Entities.Concrete
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public bool EmailConfirmed { get; set; }
        public string? EmailVerificationTokenHash { get; set; }
        public DateTime? EmailVerificationTokenExpiresAt { get; set; }
        public string? PasswordResetTokenHash { get; set; }
        public DateTime? PasswordResetTokenExpiresAt { get; set; }
        public string? PendingPasswordHash { get; set; }
        public string? PasswordChangeTokenHash { get; set; }
        public DateTime? PasswordChangeTokenExpiresAt { get; set; }

        [JsonIgnore]
        public List <Appointment> Appointments { get; set; } = new ();
    }
}
