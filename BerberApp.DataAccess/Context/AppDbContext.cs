using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BerberApp.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace BerberApp.DataAccess.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Barber> Barbers => Set<Barber>();
        public DbSet<Shop> Shops => Set<Shop>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<Conversation> Conversations => Set<Conversation>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(x => x.FullName)
                .HasMaxLength(50)
                .IsRequired();

                entity.Property(x => x.Email).
                HasMaxLength(150).
                IsRequired();

                entity.Property(x => x.PhoneNumber)
                .HasMaxLength(20);

                entity.Property(x => x.PasswordHash).
                IsRequired();

                entity.Property(x => x.Role).
                HasMaxLength(20).
                IsRequired();

                entity.Property(x => x.EmailConfirmed)
                .HasDefaultValue(false);

                entity.Property(x => x.PhoneNumberConfirmed)
                .HasDefaultValue(false);

                entity.Property(x => x.PhoneVerificationCodeHash)
                .HasMaxLength(500);

                entity.Property(x => x.EmailVerificationTokenHash)
                .HasMaxLength(500);

                entity.Property(x => x.PasswordResetTokenHash)
                .HasMaxLength(500);

                entity.Property(x => x.PendingPasswordHash)
                .HasMaxLength(500);

                entity.Property(x => x.PasswordChangeTokenHash)
                .HasMaxLength(500);
            });

            modelBuilder.Entity<Barber>(entity => 
            {
                entity.Property(x => x.FullName).HasMaxLength(100).IsRequired();

                entity.Property(x => x.Specialty).HasMaxLength(100);

                entity.HasOne(x => x.User)
                .WithOne(x => x.BarberProfile)
                .HasForeignKey<Barber>(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => x.UserId)
                .IsUnique()
                .HasFilter("[UserId] IS NOT NULL");

                entity.HasOne(x => x.Shop)
                .WithMany(x => x.Barbers)
                .HasForeignKey(x => x.ShopId)
                .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Shop>(entity =>
            {
                entity.Property(x => x.Name)
                .HasMaxLength(120)
                .IsRequired();

                entity.Property(x => x.Address)
                .HasMaxLength(300)
                .IsRequired();

                entity.Property(x => x.City)
                .HasMaxLength(80)
                .IsRequired();

                entity.Property(x => x.District)
                .HasMaxLength(80)
                .IsRequired();

                entity.HasOne(x => x.OwnerUser)
                .WithMany(x => x.OwnedShops)
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.Property(x => x.ApointmentTime).HasMaxLength(20).IsRequired();

                entity.Property(x => x.Status).HasMaxLength(20).IsRequired();

                entity.HasOne(x => x.User)
                .WithMany(x => x.Appointments)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Barber)
                .WithMany(x => x.Appointments)
                .HasForeignKey(x => x.BerberId)
                .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Conversation>(entity =>
            {
                entity.HasOne(x => x.User)
                .WithMany(x => x.Conversations)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Barber)
                .WithMany(x => x.Conversations)
                .HasForeignKey(x => x.BarberId)
                .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.Property(x => x.Content)
                .HasMaxLength(1000)
                .IsRequired();

                entity.HasOne(x => x.Conversation)
                .WithMany(x => x.Messages)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.SenderUser)
                .WithMany(x => x.SentMessages)
                .HasForeignKey(x => x.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
