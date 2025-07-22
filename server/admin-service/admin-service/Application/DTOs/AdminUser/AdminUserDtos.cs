namespace AdminService.Application.DTOs.AdminUser;

public record CreateAdminUserDto(
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string Role
);

public record UpdateAdminUserDto(
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsActive
);

public record AdminUserResponseDto(
    Guid Id,
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record LoginRequestDto(
    string Username,
    string Password
);

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    AdminUserResponseDto User
);

public record RefreshTokenRequestDto(
    string RefreshToken
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);
