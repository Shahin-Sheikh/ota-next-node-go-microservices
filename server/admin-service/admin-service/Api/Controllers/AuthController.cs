using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminService.Application.DTOs.AdminUser;
using AdminService.Application.Interfaces;

namespace AdminService.Api.Controllers;

[Route("api/v1/[controller]")]
public class AuthController : BaseController
{
    private readonly IAdminUserService _adminUserService;

    public AuthController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    /// <summary>
    /// Authenticate admin user
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication token and user details</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _adminUserService.LoginAsync(request);
        return HandleResult(result);
    }

    /// <summary>
    /// Refresh authentication token
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <returns>New authentication token</returns>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        var result = await _adminUserService.RefreshTokenAsync(request);
        return HandleResult(result);
    }

    /// <summary>
    /// Logout current user
    /// </summary>
    /// <returns>Success confirmation</returns>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _adminUserService.LogoutAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Change user password
    /// </summary>
    /// <param name="request">Password change details</param>
    /// <returns>Success confirmation</returns>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _adminUserService.ChangePasswordAsync(userId, request);
        return HandleResult(result);
    }
}
