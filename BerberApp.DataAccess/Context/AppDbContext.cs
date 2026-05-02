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
        public DbSet<Appointment> Appointments => Set<Appointment>();

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

                entity.Property(x => x.PasswordHash).
                IsRequired();

                entity.Property(x => x.Role).
                HasMaxLength(20).
                IsRequired();
            });

            modelBuilder.Entity<Barber>(entity => 
            {
                entity.Property(x => x.FullName).HasMaxLength(100).IsRequired();

                entity.Property(x => x.Specialty).HasMaxLength(100);
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
        }
    }
}
