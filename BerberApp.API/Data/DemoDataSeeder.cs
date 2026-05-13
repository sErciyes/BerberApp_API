using BerberApp.DataAccess.Context;
using BerberApp.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace BerberApp.API.Data;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();

        var adminUser = await GetOrCreateUserAsync(
            context,
            "admin@berberapp.local",
            () => new User
            {
                FullName = "Serdar Admin",
                Email = "admin@berberapp.local",
                PhoneNumber = "05550000001",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Serdar123!"),
                Role = "Admin",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                ProfileImageUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
            });

        var customerUser = await GetOrCreateUserAsync(
            context,
            "mert@berberapp.local",
            () => new User
            {
                FullName = "Mert Yilmaz",
                Email = "mert@berberapp.local",
                PhoneNumber = "05550000002",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Serdar123!"),
                Role = "User",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                ProfileImageUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
            });

        var barberUser1 = await GetOrCreateUserAsync(
            context,
            "ahmet@berberapp.local",
            () => new User
            {
                FullName = "Ahmet Cakar",
                Email = "ahmet@berberapp.local",
                PhoneNumber = "05550000003",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Serdar123!"),
                Role = "Barber",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                ProfileImageUrl = "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=400&q=80"
            });

        var barberUser2 = await GetOrCreateUserAsync(
            context,
            "has@berberapp.local",
            () => new User
            {
                FullName = "Has Berber",
                Email = "has@berberapp.local",
                PhoneNumber = "05550000004",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Serdar123!"),
                Role = "Barber",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                ProfileImageUrl = "https://images.unsplash.com/photo-1506795660185-1dfb6d2e7f7b?auto=format&fit=crop&w=400&q=80"
            });

        var shop1 = await GetOrCreateShopAsync(
            context,
            "Kadikoy Barber Studio",
            () => new Shop
            {
                Name = "Kadikoy Barber Studio",
                Address = "Bahariye Caddesi No: 52",
                City = "Istanbul",
                District = "Kadikoy",
                Latitude = 40.9909,
                Longitude = 29.0280
            });

        var shop2 = await GetOrCreateShopAsync(
            context,
            "Besiktas Classic Cut",
            () => new Shop
            {
                Name = "Besiktas Classic Cut",
                Address = "Sinanpasa Mahallesi Ihlamurdere Caddesi No: 12",
                City = "Istanbul",
                District = "Besiktas",
                Latitude = 41.0436,
                Longitude = 29.0043
            });

        var shop3 = await GetOrCreateShopAsync(
            context,
            "Sisli Groom Lab",
            () => new Shop
            {
                Name = "Sisli Groom Lab",
                Address = "Mesrutiyet Mahallesi Halaskargazi Caddesi No: 90",
                City = "Istanbul",
                District = "Sisli",
                Latitude = 41.0491,
                Longitude = 28.9878
            });

        var shop4 = await GetOrCreateShopAsync(
            context,
            "Uskudar Fade House",
            () => new Shop
            {
                Name = "Uskudar Fade House",
                Address = "Mimar Sinan Mahallesi Hakimiyeti Milliye Caddesi No: 21",
                City = "Istanbul",
                District = "Uskudar",
                Latitude = 41.0234,
                Longitude = 29.0152
            });

        var shop5 = await GetOrCreateShopAsync(
            context,
            "Atasehir Gentlemen Club",
            () => new Shop
            {
                Name = "Atasehir Gentlemen Club",
                Address = "Ataturk Mahallesi Ertugrul Gazi Sokak No: 8",
                City = "Istanbul",
                District = "Atasehir",
                Latitude = 40.9927,
                Longitude = 29.1244
            });

        var shop6 = await GetOrCreateShopAsync(
            context,
            "Beyoglu Trim Point",
            () => new Shop
            {
                Name = "Beyoglu Trim Point",
                Address = "Kuloglu Mahallesi Istiklal Caddesi No: 143",
                City = "Istanbul",
                District = "Beyoglu",
                Latitude = 41.0351,
                Longitude = 28.9833
            });

        var barber1 = await GetOrCreateBarberAsync(
            context,
            barberUser1.Id,
            () => new Barber
            {
                FullName = barberUser1.FullName,
                Specialty = "Sac Kesim Uzmani",
                UserId = barberUser1.Id,
                ShopId = shop1.Id,
                ProfileImageUrl = barberUser1.ProfileImageUrl
            });

        var barber2 = await GetOrCreateBarberAsync(
            context,
            barberUser2.Id,
            () => new Barber
            {
                FullName = barberUser2.FullName,
                Specialty = "Sac Sakal",
                UserId = barberUser2.Id,
                ShopId = shop2.Id,
                ProfileImageUrl = barberUser2.ProfileImageUrl
            });

        var barber3 = await GetOrCreateBarberByNameAsync(
            context,
            "Abdulrezzak Bin Basayri",
            () => new Barber
            {
                FullName = "Abdulrezzak Bin Basayri",
                Specialty = "Perma/Sac Sekillendirme",
                ShopId = shop3.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Serdar Erciyas",
            () => new Barber
            {
                FullName = "Serdar Erciyas",
                Specialty = "Sac Kesim",
                ShopId = shop1.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Mehmet Usta",
            () => new Barber
            {
                FullName = "Mehmet Usta",
                Specialty = "Sakal Tirasi",
                ShopId = shop2.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Ali Riza Usta",
            () => new Barber
            {
                FullName = "Ali Riza Usta",
                Specialty = "Perma/Sac Sekillendirme",
                ShopId = shop3.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Muhammed Uslu Cirak",
            () => new Barber
            {
                FullName = "Muhammed Uslu Cirak",
                Specialty = "Maske/Bakim",
                ShopId = shop4.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Test Berber",
            () => new Barber
            {
                FullName = "Test Berber",
                Specialty = "Sac Kesim",
                ShopId = shop5.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Yasin Makas",
            () => new Barber
            {
                FullName = "Yasin Makas",
                Specialty = "Skin Fade",
                ShopId = shop6.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Burak Tarakci",
            () => new Barber
            {
                FullName = "Burak Tarakci",
                Specialty = "Cocuk Kesimi",
                ShopId = shop4.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?auto=format&fit=crop&w=400&q=80"
            });

        await GetOrCreateBarberByNameAsync(
            context,
            "Kaan Styling",
            () => new Barber
            {
                FullName = "Kaan Styling",
                Specialty = "Boya ve Tasarim",
                ShopId = shop5.Id,
                ProfileImageUrl = "https://images.unsplash.com/photo-1502767089025-6572583495b0?auto=format&fit=crop&w=400&q=80"
            });

        if (!await context.Appointments.AnyAsync())
        {
            var today = DateTime.Today;
            context.Appointments.AddRange(
                new Appointment
                {
                    UserId = customerUser.Id,
                    BerberId = barber1.Id,
                    AppointmentDate = today,
                    ApointmentTime = "14:00",
                    Status = "Approved"
                },
                new Appointment
                {
                    UserId = customerUser.Id,
                    BerberId = barber2.Id,
                    AppointmentDate = today.AddDays(2),
                    ApointmentTime = "11:30",
                    Status = "Pending"
                });

            await context.SaveChangesAsync();
        }

        if (!await context.Conversations.AnyAsync())
        {
            var conversation = new Conversation
            {
                UserId = customerUser.Id,
                BarberId = barber1.Id,
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                LastMessageAt = DateTime.UtcNow.AddMinutes(-15)
            };

            context.Conversations.Add(conversation);
            await context.SaveChangesAsync();

            context.ChatMessages.AddRange(
                new ChatMessage
                {
                    ConversationId = conversation.Id,
                    SenderUserId = customerUser.Id,
                    Content = "Selam abi, bugun 14:00 randevum net mi?",
                    IsRead = true,
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                },
                new ChatMessage
                {
                    ConversationId = conversation.Id,
                    SenderUserId = barberUser1.Id,
                    Content = "Net kardesim, seni bekliyorum.",
                    IsRead = true,
                    CreatedAt = DateTime.UtcNow.AddHours(-1).AddMinutes(-45)
                });

            await context.SaveChangesAsync();
        }
    }

    private static async Task<User> GetOrCreateUserAsync(AppDbContext context, string email, Func<User> factory)
    {
        var existing = await context.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (existing is not null)
        {
            return existing;
        }

        var user = factory();
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    private static async Task<Shop> GetOrCreateShopAsync(AppDbContext context, string name, Func<Shop> factory)
    {
        var existing = await context.Shops.FirstOrDefaultAsync(x => x.Name == name);
        if (existing is not null)
        {
            return existing;
        }

        var shop = factory();
        context.Shops.Add(shop);
        await context.SaveChangesAsync();
        return shop;
    }

    private static async Task<Barber> GetOrCreateBarberAsync(AppDbContext context, int userId, Func<Barber> factory)
    {
        var existing = await context.Barbers.FirstOrDefaultAsync(x => x.UserId == userId);
        if (existing is not null)
        {
            return existing;
        }

        var barber = factory();
        context.Barbers.Add(barber);
        await context.SaveChangesAsync();
        return barber;
    }

    private static async Task<Barber> GetOrCreateBarberByNameAsync(AppDbContext context, string fullName, Func<Barber> factory)
    {
        var existing = await context.Barbers.FirstOrDefaultAsync(x => x.FullName == fullName);
        if (existing is not null)
        {
            return existing;
        }

        var barber = factory();
        context.Barbers.Add(barber);
        await context.SaveChangesAsync();
        return barber;
    }
}
