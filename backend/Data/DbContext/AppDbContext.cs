using Microsoft.EntityFrameworkCore;
using Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Users> Users { get; set; }
    public DbSet<Devices> Devices { get; set; }
    public DbSet<Measurement> Measurements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Users>().ToTable("users");
        modelBuilder.Entity<Devices>().ToTable("devices");
        modelBuilder.Entity<Measurement>().ToTable("measurements");

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasKey(u => u.user_uid);
            entity.Property(u => u.username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.password_hash).IsRequired().HasMaxLength(256);
        });

        modelBuilder.Entity<Devices>(entity =>
        {
            entity.HasKey(d => d.device_id);
            entity.Property(d => d.name).IsRequired().HasMaxLength(100);
            entity.Property(d => d.location).HasMaxLength(100);
            entity.Property(d => d.registered_at).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasOne<Users>()
                  .WithMany()
                  .HasForeignKey(d => d.user_id)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Measurement>(entity =>
        {
            entity.HasKey(m => m.measurement_id);
            entity.Property(m => m.timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(m => m.temperature);
            entity.Property(m => m.co2);
            entity.Property(m => m.humidity);
            entity.HasOne<Devices>()
                  .WithMany()
                  .HasForeignKey(m => m.device_id)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}