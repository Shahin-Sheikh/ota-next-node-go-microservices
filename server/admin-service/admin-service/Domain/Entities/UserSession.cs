using AdminService.Domain.Common;

namespace AdminService.Domain.Entities;

public class UserSession : BaseEntity
{
    public Guid AdminUserId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public AdminUser AdminUser { get; set; } = null!;
}
