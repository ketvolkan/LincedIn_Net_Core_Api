using Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework.Contexts;

public class BossBattleDbContext : DbContext
{
    public BossBattleDbContext(DbContextOptions<BossBattleDbContext> options) : base(options)
    {
    }

    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<Boss> Bosses { get; set; } = null!;
    public DbSet<PunchLog> PunchLogs { get; set; } = null!;
    public DbSet<AdminUser> AdminUsers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RoomCode).IsRequired().HasMaxLength(32);
            entity.HasIndex(e => e.RoomCode).IsUnique();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(150);

            entity.HasOne(e => e.Boss)
                  .WithMany()
                  .HasForeignKey(e => e.BossId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Boss>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(120);
            entity.Property(e => e.Headline).HasMaxLength(300);
            entity.Property(e => e.AvatarUrl).HasMaxLength(1000);
            entity.Property(e => e.LinkedInUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<PunchLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlayerName).IsRequired().HasMaxLength(60);

            entity.HasOne(e => e.Room)
                  .WithMany(r => r.PunchLogs)
                  .HasForeignKey(e => e.RoomId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(60);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordSalt).IsRequired().HasMaxLength(256);
        });
    }
}
