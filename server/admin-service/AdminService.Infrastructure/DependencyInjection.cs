using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using AdminService.Infrastructure.Persistence;

namespace AdminService.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<AdminServiceDbContext>(options =>
                options.UseNpgsql(connectionString));
            services.AddScoped<AdminService.Domain.Interfaces.IAdminRepository, AdminService.Infrastructure.Repositories.AdminRepository>();
            return services;
        }
    }
}
