using AdminService.Application.Models;
using AdminService.Domain.Entities;
using AdminService.Domain.Interfaces;
using MediatR;

namespace AdminService.Application.Commands;

public static class CreateAdmin
{
    public record Command(CreateAdminUserDTO Admin) : IRequest<AdminUserDTO>;

    public class Handler : IRequestHandler<Command, AdminUserDTO>
    {
        private readonly IAdminRepository _adminRepository;

        public Handler(IAdminRepository adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<AdminUserDTO> Handle(Command request, CancellationToken cancellationToken)
        {
            var admin = new AdminUser
            {
                Email = request.Admin.Email,
                Name = request.Admin.Name
            };

            var createdAdmin = await _adminRepository.AddAdmin(admin);
            
            return new AdminUserDTO(
                createdAdmin.Id,
                createdAdmin.Email,
                createdAdmin.Name,
                createdAdmin.CreatedAt,
                createdAdmin.UpdatedAt);
        }
    }
}