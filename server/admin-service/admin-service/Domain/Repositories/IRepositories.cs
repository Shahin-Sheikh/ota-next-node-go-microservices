using AdminService.Domain.Entities;

namespace AdminService.Domain.Repositories;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> CountAsync();
    Task<IEnumerable<T>> GetPagedAsync(int pageNumber, int pageSize);
}

public interface IAdminUserRepository : IGenericRepository<AdminUser>
{
    Task<AdminUser?> GetByUsernameAsync(string username);
    Task<AdminUser?> GetByEmailAsync(string email);
    Task<bool> IsUsernameExistsAsync(string username);
    Task<bool> IsEmailExistsAsync(string email);
    Task<IEnumerable<AdminUser>> GetActiveUsersAsync();
}

public interface IHotelRepository : IGenericRepository<Hotel>
{
    Task<IEnumerable<Hotel>> GetHotelsByCityAsync(string city);
    Task<IEnumerable<Hotel>> GetActiveHotelsAsync();
    Task<Hotel?> GetHotelWithRoomsAsync(Guid hotelId);
    Task<IEnumerable<Hotel>> SearchHotelsAsync(string searchTerm);
}

public interface IRoomRepository : IGenericRepository<Room>
{
    Task<IEnumerable<Room>> GetRoomsByHotelIdAsync(Guid hotelId);
    Task<IEnumerable<Room>> GetAvailableRoomsAsync(Guid hotelId);
    Task<Room?> GetRoomWithAmenitiesAsync(Guid roomId);
}

public interface IAuditLogRepository : IGenericRepository<AuditLog>
{
    Task<IEnumerable<AuditLog>> GetLogsByUserIdAsync(Guid userId);
    Task<IEnumerable<AuditLog>> GetLogsByEntityAsync(string entityName, Guid entityId);
    Task<IEnumerable<AuditLog>> GetLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
}

public interface IUserSessionRepository : IGenericRepository<UserSession>
{
    Task<IEnumerable<UserSession>> GetActiveSessionsByUserIdAsync(Guid userId);
    Task<UserSession?> GetBySessionTokenAsync(string sessionToken);
    Task DeactivateExpiredSessionsAsync();
    Task DeactivateUserSessionsAsync(Guid userId);
}
