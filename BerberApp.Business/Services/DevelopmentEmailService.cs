namespace BerberApp.Business.Services
{
    public class DevelopmentEmailService : IEmailService
    {
        public void SendEmail(string to, string subject, string body, bool isHtml = false)
        {
            Console.WriteLine("----- BERBERAPP DEVELOPMENT EMAIL -----");
            Console.WriteLine($"To: {to}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine($"Html: {isHtml}");
            Console.WriteLine(body);
            Console.WriteLine("---------------------------------------");
        }
    }
}
