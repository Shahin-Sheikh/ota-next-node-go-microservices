using AdminService.Domain.Common;

namespace AdminService.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid AdminUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string OldValues { get; set; } = string.Empty;
    public string NewValues { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;

    // Navigation properties
    public AdminUser AdminUser { get; set; } = null!;
}
