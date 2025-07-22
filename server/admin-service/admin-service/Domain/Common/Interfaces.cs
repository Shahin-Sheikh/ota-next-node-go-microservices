namespace AdminService.Domain.Common;

public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    DateTime UpdatedAt { get; set; }
    string CreatedBy { get; set; }
    string UpdatedBy { get; set; }
}

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}
