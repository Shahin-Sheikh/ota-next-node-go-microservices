using AdminService.Application.Common;
using AdminService.Application.DTOs.AdminUser;
using AdminService.Application.DTOs.Hotel;
using AdminService.Application.DTOs.Room;

namespace AdminService.Application.Interfaces;

public interface IAdminUserService
{
    Task<Result<AdminUserResponseDto>> CreateAsync(CreateAdminUserDto dto);
    Task<Result<AdminUserResponseDto>> UpdateAsync(Guid id, UpdateAdminUserDto dto);
    Task<Result> DeleteAsync(Guid id);
    Task<Result<AdminUserResponseDto>> GetByIdAsync(Guid id);
    Task<Result<IEnumerable<AdminUserResponseDto>>> GetAllAsync();
    Task<Result<PaginatedResult<AdminUserResponseDto>>> GetPagedAsync(int pageNumber, int pageSize);
    Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto dto);
    Task<Result<LoginResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task<Result> LogoutAsync(Guid userId);
    Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}

public interface IHotelService
{
    Task<Result<HotelResponseDto>> CreateAsync(CreateHotelDto dto);
    Task<Result<HotelResponseDto>> UpdateAsync(Guid id, UpdateHotelDto dto);
    Task<Result> DeleteAsync(Guid id);
    Task<Result<HotelResponseDto>> GetByIdAsync(Guid id);
    Task<Result<IEnumerable<HotelSummaryDto>>> GetAllAsync();
    Task<Result<PaginatedResult<HotelSummaryDto>>> GetPagedAsync(int pageNumber, int pageSize);
    Task<Result<IEnumerable<HotelSummaryDto>>> SearchAsync(HotelSearchDto searchDto);
    Task<Result<HotelResponseDto>> GetWithRoomsAsync(Guid id);
}

public interface IRoomService
{
    Task<Result<RoomResponseDto>> CreateAsync(CreateRoomDto dto);
    Task<Result<RoomResponseDto>> UpdateAsync(Guid id, UpdateRoomDto dto);
    Task<Result> DeleteAsync(Guid id);
    Task<Result<RoomResponseDto>> GetByIdAsync(Guid id);
    Task<Result<IEnumerable<RoomResponseDto>>> GetByHotelIdAsync(Guid hotelId);
    Task<Result<IEnumerable<RoomResponseDto>>> GetAvailableRoomsAsync(Guid hotelId);
}

public interface IAuthService
{
    string GenerateAccessToken(Guid userId, string username, string role);
    string GenerateRefreshToken();
    Task<bool> ValidateRefreshTokenAsync(Guid userId, string refreshToken);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
}
