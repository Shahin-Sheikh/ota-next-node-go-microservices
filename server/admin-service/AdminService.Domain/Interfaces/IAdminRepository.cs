// In AdminService.Domain/Interfaces/IAdminRepository.cs
using AdminService.Domain.Entities;

namespace AdminService.Domain.Interfaces;

public interface IAdminRepository
{
    Task<AdminUser> AddAdmin(AdminUser admin);
    Task<bool> DeleteAdmin(Guid id);
    Task<IEnumerable<AdminUser>> GetAllAdmins();
    Task<AdminUser?> GetAdminById(Guid id);
    Task<bool> UpdateAdmin(AdminUser admin);
}