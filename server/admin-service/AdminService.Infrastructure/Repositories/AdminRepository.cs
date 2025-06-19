using AdminService.Domain.Entities;
using AdminService.Domain.Interfaces;
using AdminService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AdminServiceDbContext _context;

    public AdminRepository(AdminServiceDbContext context)
    {
        _context = context;
    }

    public async Task<AdminUser> AddAdmin(AdminUser admin)
    {
        await _context.AdminUsers.AddAsync(admin);
        await _context.SaveChangesAsync();
        return admin;
    }

    public async Task<bool> DeleteAdmin(Guid id)
    {
        var admin = await _context.AdminUsers.FindAsync(id);
        if (admin == null) return false;
        
        _context.AdminUsers.Remove(admin);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<AdminUser>> GetAllAdmins()
    {
        return await _context.AdminUsers.ToListAsync();
    }

    public async Task<AdminUser?> GetAdminById(Guid id)
    {
        return await _context.AdminUsers.FindAsync(id);
    }

    public async Task<bool> UpdateAdmin(AdminUser admin)
    {
        _context.AdminUsers.Update(admin);
        return await _context.SaveChangesAsync() > 0;
    }
}