using AutoMapper;
using FluentValidation;
using AdminService.Application.Common;
using AdminService.Application.DTOs.AdminUser;
using AdminService.Application.Interfaces;
using AdminService.Domain.Entities;
using AdminService.Domain.Exceptions;
using AdminService.Domain.Repositories;

namespace AdminService.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IAdminUserRepository _userRepository;
    private readonly IUserSessionRepository _sessionRepository;
    private readonly IAuthService _authService;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateAdminUserDto> _createValidator;
    private readonly IValidator<UpdateAdminUserDto> _updateValidator;
    private readonly IValidator<LoginRequestDto> _loginValidator;
    private readonly IValidator<ChangePasswordDto> _changePasswordValidator;

    public AdminUserService(
        IAdminUserRepository userRepository,
        IUserSessionRepository sessionRepository,
        IAuthService authService,
        IMapper mapper,
        IValidator<CreateAdminUserDto> createValidator,
        IValidator<UpdateAdminUserDto> updateValidator,
        IValidator<LoginRequestDto> loginValidator,
        IValidator<ChangePasswordDto> changePasswordValidator)
    {
        _userRepository = userRepository;
        _sessionRepository = sessionRepository;
        _authService = authService;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _loginValidator = loginValidator;
        _changePasswordValidator = changePasswordValidator;
    }

    public async Task<Result<AdminUserResponseDto>> CreateAsync(CreateAdminUserDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Result<AdminUserResponseDto>.Failure(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        // Check if username or email already exists
        if (await _userRepository.IsUsernameExistsAsync(dto.Username))
        {
            return Result<AdminUserResponseDto>.Failure($"Username '{dto.Username}' already exists.");
        }

        if (await _userRepository.IsEmailExistsAsync(dto.Email))
        {
            return Result<AdminUserResponseDto>.Failure($"Email '{dto.Email}' already exists.");
        }

        var user = new AdminUser
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PasswordHash = _authService.HashPassword(dto.Password),
            Role = dto.Role,
            IsActive = true
        };

        var createdUser = await _userRepository.AddAsync(user);
        var responseDto = _mapper.Map<AdminUserResponseDto>(createdUser);

        return Result<AdminUserResponseDto>.Success(responseDto);
    }

    public async Task<Result<AdminUserResponseDto>> UpdateAsync(Guid id, UpdateAdminUserDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Result<AdminUserResponseDto>.Failure(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return Result<AdminUserResponseDto>.Failure($"User with ID {id} not found.");
        }

        // Check if email already exists for another user
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null && existingUser.Id != id)
        {
            return Result<AdminUserResponseDto>.Failure($"Email '{dto.Email}' already exists.");
        }

        user.Email = dto.Email;
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = dto.Role;
        user.IsActive = dto.IsActive;

        var updatedUser = await _userRepository.UpdateAsync(user);
        var responseDto = _mapper.Map<AdminUserResponseDto>(updatedUser);

        return Result<AdminUserResponseDto>.Success(responseDto);
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return Result.Failure($"User with ID {id} not found.");
        }

        await _userRepository.DeleteAsync(id);
        return Result.Success();
    }

    public async Task<Result<AdminUserResponseDto>> GetByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return Result<AdminUserResponseDto>.Failure($"User with ID {id} not found.");
        }

        var responseDto = _mapper.Map<AdminUserResponseDto>(user);
        return Result<AdminUserResponseDto>.Success(responseDto);
    }

    public async Task<Result<IEnumerable<AdminUserResponseDto>>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var responseDtos = _mapper.Map<IEnumerable<AdminUserResponseDto>>(users);

        return Result<IEnumerable<AdminUserResponseDto>>.Success(responseDtos);
    }

    public async Task<Result<PaginatedResult<AdminUserResponseDto>>> GetPagedAsync(int pageNumber, int pageSize)
    {
        var users = await _userRepository.GetPagedAsync(pageNumber, pageSize);
        var totalCount = await _userRepository.CountAsync();
        var responseDtos = _mapper.Map<IEnumerable<AdminUserResponseDto>>(users);

        var paginatedResult = new PaginatedResult<AdminUserResponseDto>(responseDtos, totalCount, pageNumber, pageSize);
        return Result<PaginatedResult<AdminUserResponseDto>>.Success(paginatedResult);
    }

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto dto)
    {
        var validationResult = await _loginValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Result<LoginResponseDto>.Failure(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var user = await _userRepository.GetByUsernameAsync(dto.Username);
        if (user == null || !_authService.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return Result<LoginResponseDto>.Failure("Invalid username or password.");
        }

        if (!user.IsActive)
        {
            return Result<LoginResponseDto>.Failure("Account is deactivated.");
        }

        // Generate tokens
        var accessToken = _authService.GenerateAccessToken(user.Id, user.Username, user.Role);
        var refreshToken = _authService.GenerateRefreshToken();

        // Update user's last login and refresh token
        user.LastLoginAt = DateTime.UtcNow;
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);

        // Create session
        var session = new UserSession
        {
            Id = Guid.NewGuid(),
            AdminUserId = user.Id,
            SessionToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsActive = true
        };
        await _sessionRepository.AddAsync(session);

        var userResponse = _mapper.Map<AdminUserResponseDto>(user);
        var loginResponse = new LoginResponseDto(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(60), userResponse);

        return Result<LoginResponseDto>.Success(loginResponse);
    }

    public async Task<Result<LoginResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        var session = await _sessionRepository.GetBySessionTokenAsync(dto.RefreshToken);
        if (session == null || !session.IsActive || session.ExpiresAt <= DateTime.UtcNow)
        {
            return Result<LoginResponseDto>.Failure("Invalid or expired refresh token.");
        }

        var user = session.AdminUser;
        if (!user.IsActive)
        {
            return Result<LoginResponseDto>.Failure("Account is deactivated.");
        }

        // Generate new tokens
        var accessToken = _authService.GenerateAccessToken(user.Id, user.Username, user.Role);
        var refreshToken = _authService.GenerateRefreshToken();

        // Update session
        session.SessionToken = refreshToken;
        session.ExpiresAt = DateTime.UtcNow.AddDays(7);
        await _sessionRepository.UpdateAsync(session);

        // Update user's refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);

        var userResponse = _mapper.Map<AdminUserResponseDto>(user);
        var loginResponse = new LoginResponseDto(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(60), userResponse);

        return Result<LoginResponseDto>.Success(loginResponse);
    }

    public async Task<Result> LogoutAsync(Guid userId)
    {
        await _sessionRepository.DeactivateUserSessionsAsync(userId);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _userRepository.UpdateAsync(user);
        }

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var validationResult = await _changePasswordValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Result.Failure(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return Result.Failure($"User with ID {userId} not found.");
        }

        if (!_authService.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
        {
            return Result.Failure("Current password is incorrect.");
        }

        user.PasswordHash = _authService.HashPassword(dto.NewPassword);
        await _userRepository.UpdateAsync(user);

        // Invalidate all sessions
        await _sessionRepository.DeactivateUserSessionsAsync(userId);

        return Result.Success();
    }
}
