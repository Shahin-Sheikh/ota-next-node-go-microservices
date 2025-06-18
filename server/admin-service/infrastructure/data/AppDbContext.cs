public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Hotel> Hotels { get; set; }
    public DbSet<Customer> Customers { get; set; }
}
