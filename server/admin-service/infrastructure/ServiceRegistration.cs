public static class ServiceRegistration
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
    {
        // PostgreSQL EF Core setup
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        // gRPC clients
        services.AddGrpcClient<HotelGrpc.HotelGrpcClient>(o =>
        {
            o.Address = new Uri(config["GrpcSettings:HotelServiceUrl"]);
        });

        services.AddScoped<IHotelServiceClient, HotelServiceClient>();

        // Repository registration
        services.AddScoped<IHotelRepository, HotelRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();

        return services;
    }
}
