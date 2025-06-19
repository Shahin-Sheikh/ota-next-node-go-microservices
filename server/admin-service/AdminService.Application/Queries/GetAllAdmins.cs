using AdminService.Application.Models;
using AdminService.Domain.Interfaces;
using MediatR;

namespace AdminService.Application.Queries;

public static class GetAllAdmins
{
    public record Query : IRequest<IEnumerable<AdminUserDTO>>;

    public class Handler : IRequestHandler<Query, IEnumerable<AdminUserDTO>>
    {
        private readonly IAdminRepository _adminRepository;

        public Handler(IAdminRepository adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<IEnumerable<AdminUserDTO>> Handle(Query request, CancellationToken cancellationToken)
        {
            var admins = await _adminRepository.GetAllAdmins();
            return admins.Select(admin => new AdminUserDTO(
                admin.Id,
                admin.Email,
                admin.Name,
                admin.CreatedAt,
                admin.UpdatedAt));
        }
    }
}