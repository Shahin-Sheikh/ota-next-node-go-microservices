using AdminService.Application.Models;
using AdminService.Domain.Entities;
using AdminService.Domain.Interfaces;
using MediatR;

namespace AdminService.Application.Commands;

public static class UpdateAdmin
{
    public record Command(Guid Id, UpdateAdminUserDTO Admin) : IRequest<bool>;

    public class Handler : IRequestHandler<Command, bool>
    {
        private readonly IAdminRepository _adminRepository;

        public Handler(IAdminRepository adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            var existingAdmin = await _adminRepository.GetAdminById(request.Id);
            if (existingAdmin == null) return false;

            existingAdmin.Email = request.Admin.Email;
            existingAdmin.Name = request.Admin.Name;
            existingAdmin.UpdatedAt = DateTime.UtcNow;

            return await _adminRepository.UpdateAdmin(existingAdmin);
        }
    }
}