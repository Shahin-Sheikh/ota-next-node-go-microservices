using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminService.Application.DTOs.AdminUser;
using AdminService.Application.Interfaces;

namespace AdminService.Api.Controllers;

[Route("api/v1/[controller]")]
[Authorize(Roles = "SuperAdmin,Admin")]
public class AdminUsersController : BaseController
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    /// <summary>
    /// Get all admin users with pagination
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <returns>Paginated list of admin users</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _adminUserService.GetPagedAsync(pageNumber, pageSize);
        return HandleResult(result);
    }

    /// <summary>
    /// Get admin user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Admin user details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _adminUserService.GetByIdAsync(id);
        return HandleResult(result);
    }

    /// <summary>
    /// Create new admin user
    /// </summary>
    /// <param name="request">User creation details</param>
    /// <returns>Created user details</returns>
    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateAdminUserDto request)
    {
        var result = await _adminUserService.CreateAsync(request);
        return HandleResult(result);
    }

    /// <summary>
    /// Update admin user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">User update details</param>
    /// <returns>Updated user details</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAdminUserDto request)
    {
        var result = await _adminUserService.UpdateAsync(id, request);
        return HandleResult(result);
    }

    /// <summary>
    /// Delete admin user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success confirmation</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _adminUserService.DeleteAsync(id);
        return HandleResult(result);
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    /// <returns>Current user details</returns>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _adminUserService.GetByIdAsync(userId);
        return HandleResult(result);
    }
}
