namespace AdminService.Application.Models;

public record AdminUserDTO(
    Guid Id,
    string Email,
    string Name,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateAdminUserDTO(
    string Email,
    string Name);

public record UpdateAdminUserDTO(
    string Email,
    string Name);