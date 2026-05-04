using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace BerberApp.Business.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void SendEmail(string to, string subject, string body)
        {
            var host = GetRequiredSetting("Email:Smtp:Host");
            var username = GetRequiredSetting("Email:Smtp:UserName");
            var password = GetRequiredSetting("Email:Smtp:Password");
            var fromEmail = GetRequiredSetting("Email:Smtp:FromEmail");
            var fromName = _configuration["Email:Smtp:FromName"] ?? "BerberApp";
            var port = int.TryParse(_configuration["Email:Smtp:Port"], out var configuredPort)
                ? configuredPort
                : 587;
            var enableSsl = !bool.TryParse(_configuration["Email:Smtp:EnableSsl"], out var configuredSsl) || configuredSsl;

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };

            message.To.Add(to);

            using var smtpClient = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(username, password)
            };

            smtpClient.Send(message);
        }

        private string GetRequiredSetting(string key)
        {
            return _configuration[key]
                ?? throw new InvalidOperationException($"{key} appsettings icinde bulunamadi.");
        }
    }
}
