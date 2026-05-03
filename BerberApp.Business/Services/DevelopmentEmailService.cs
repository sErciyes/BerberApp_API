namespace BerberApp.Business.Services
{
    public class DevelopmentEmailService : IEmailService
    {
        public void SendEmail(string to, string subject, string body)
        {
            Console.WriteLine("----- BERBERAPP DEVELOPMENT EMAIL -----");
            Console.WriteLine($"To: {to}");
            Console.WriteLine($"Subject: {subject}");
            Console.WriteLine(body);
            Console.WriteLine("---------------------------------------");
        }
    }
}
