using AdminService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Infrastructure.Persistence;

public class AdminServiceDbContext : DbContext
{
    public AdminServiceDbContext(DbContextOptions<AdminServiceDbContext> options) 
        : base(options)
    {
    }

    public DbSet<AdminUser> AdminUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminUser>().HasKey(a => a.Id);
        modelBuilder.Entity<AdminUser>().Property(a => a.Email).IsRequired();
        modelBuilder.Entity<AdminUser>().Property(a => a.Name).IsRequired();
        
        base.OnModelCreating(modelBuilder);
    }
}