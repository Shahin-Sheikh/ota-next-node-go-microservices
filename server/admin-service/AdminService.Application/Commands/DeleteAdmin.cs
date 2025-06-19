using AdminService.Domain.Interfaces;
using MediatR;

namespace AdminService.Application.Commands;

public static class DeleteAdmin
{
    public record Command(Guid Id) : IRequest<bool>;

    public class Handler : IRequestHandler<Command, bool>
    {
        private readonly IAdminRepository _adminRepository;

        public Handler(IAdminRepository adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            return await _adminRepository.DeleteAdmin(request.Id);
        }
    }
}