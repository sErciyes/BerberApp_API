namespace BerberApp.Business.Services
{
    public class DevelopmentSmsService : ISmsService
    {
        public void SendSms(string phoneNumber, string message)
        {
            Console.WriteLine("----- BERBERAPP DEVELOPMENT SMS -----");
            Console.WriteLine($"To: {phoneNumber}");
            Console.WriteLine(message);
            Console.WriteLine("-------------------------------------");
        }
    }
}
