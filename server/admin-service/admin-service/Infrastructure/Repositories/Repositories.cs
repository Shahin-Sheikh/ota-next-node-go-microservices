using Microsoft.EntityFrameworkCore;
using AdminService.Domain.Entities;
using AdminService.Domain.Repositories;
using AdminService.Infrastructure.Data;

namespace AdminService.Infrastructure.Repositories;

public class AdminUserRepository : GenericRepository<AdminUser>, IAdminUserRepository
{
    public AdminUserRepository(AdminDbContext context) : base(context) { }

    public async Task<AdminUser?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .Include(u => u.Sessions)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<AdminUser?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.Sessions)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> IsUsernameExistsAsync(string username)
    {
        return await _dbSet.AnyAsync(u => u.Username == username);
    }

    public async Task<bool> IsEmailExistsAsync(string email)
    {
        return await _dbSet.AnyAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<AdminUser>> GetActiveUsersAsync()
    {
        return await _dbSet
            .Where(u => u.IsActive)
            .OrderBy(u => u.FirstName)
            .ToListAsync();
    }
}

public class HotelRepository : GenericRepository<Hotel>, IHotelRepository
{
    public HotelRepository(AdminDbContext context) : base(context) { }

    public async Task<IEnumerable<Hotel>> GetHotelsByCityAsync(string city)
    {
        return await _dbSet
            .Where(h => h.City.ToLower() == city.ToLower())
            .OrderBy(h => h.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Hotel>> GetActiveHotelsAsync()
    {
        return await _dbSet
            .Where(h => h.IsActive)
            .OrderBy(h => h.Name)
            .ToListAsync();
    }

    public async Task<Hotel?> GetHotelWithRoomsAsync(Guid hotelId)
    {
        return await _dbSet
            .Include(h => h.Rooms)
                .ThenInclude(r => r.Amenities)
            .Include(h => h.Amenities)
            .FirstOrDefaultAsync(h => h.Id == hotelId);
    }

    public async Task<IEnumerable<Hotel>> SearchHotelsAsync(string searchTerm)
    {
        var lowercaseSearchTerm = searchTerm.ToLower();
        return await _dbSet
            .Where(h => h.Name.ToLower().Contains(lowercaseSearchTerm) ||
                       h.City.ToLower().Contains(lowercaseSearchTerm) ||
                       h.Country.ToLower().Contains(lowercaseSearchTerm) ||
                       h.Description.ToLower().Contains(lowercaseSearchTerm))
            .OrderBy(h => h.Name)
            .ToListAsync();
    }
}

public class RoomRepository : GenericRepository<Room>, IRoomRepository
{
    public RoomRepository(AdminDbContext context) : base(context) { }

    public async Task<IEnumerable<Room>> GetRoomsByHotelIdAsync(Guid hotelId)
    {
        return await _dbSet
            .Where(r => r.HotelId == hotelId)
            .Include(r => r.Amenities)
            .OrderBy(r => r.RoomNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(Guid hotelId)
    {
        return await _dbSet
            .Where(r => r.HotelId == hotelId && r.IsAvailable)
            .Include(r => r.Amenities)
            .OrderBy(r => r.RoomNumber)
            .ToListAsync();
    }

    public async Task<Room?> GetRoomWithAmenitiesAsync(Guid roomId)
    {
        return await _dbSet
            .Include(r => r.Amenities)
            .Include(r => r.Hotel)
            .FirstOrDefaultAsync(r => r.Id == roomId);
    }
}

public class AuditLogRepository : GenericRepository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(AdminDbContext context) : base(context) { }

    public async Task<IEnumerable<AuditLog>> GetLogsByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(al => al.AdminUserId == userId)
            .Include(al => al.AdminUser)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetLogsByEntityAsync(string entityName, Guid entityId)
    {
        return await _dbSet
            .Where(al => al.EntityName == entityName && al.EntityId == entityId)
            .Include(al => al.AdminUser)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(al => al.CreatedAt >= startDate && al.CreatedAt <= endDate)
            .Include(al => al.AdminUser)
            .OrderByDescending(al => al.CreatedAt)
            .ToListAsync();
    }
}

public class UserSessionRepository : GenericRepository<UserSession>, IUserSessionRepository
{
    public UserSessionRepository(AdminDbContext context) : base(context) { }

    public async Task<IEnumerable<UserSession>> GetActiveSessionsByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(s => s.AdminUserId == userId && s.IsActive && s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<UserSession?> GetBySessionTokenAsync(string sessionToken)
    {
        return await _dbSet
            .Include(s => s.AdminUser)
            .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);
    }

    public async Task DeactivateExpiredSessionsAsync()
    {
        var expiredSessions = await _dbSet
            .Where(s => s.IsActive && s.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync();

        foreach (var session in expiredSessions)
        {
            session.IsActive = false;
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeactivateUserSessionsAsync(Guid userId)
    {
        var userSessions = await _dbSet
            .Where(s => s.AdminUserId == userId && s.IsActive)
            .ToListAsync();

        foreach (var session in userSessions)
        {
            session.IsActive = false;
        }

        await _context.SaveChangesAsync();
    }
}
