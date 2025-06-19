using AdminService.Application.Models;
using AdminService.Domain.Interfaces;
using MediatR;

namespace AdminService.Application.Queries;

public static class GetAdminById
{
    public record Query(Guid Id) : IRequest<AdminUserDTO?>;

    public class Handler : IRequestHandler<Query, AdminUserDTO?>
    {
        private readonly IAdminRepository _adminRepository;

        public Handler(IAdminRepository adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<AdminUserDTO?> Handle(Query request, CancellationToken cancellationToken)
        {
            var admin = await _adminRepository.GetAdminById(request.Id);
            if (admin == null) return null;

            return new AdminUserDTO(
                admin.Id,
                admin.Email,
                admin.Name,
                admin.CreatedAt,
                admin.UpdatedAt);
        }
    }
}