namespace BerberApp.Business.Services
{
    public interface ISmsService
    {
        void SendSms(string phoneNumber, string message);
    }
}
