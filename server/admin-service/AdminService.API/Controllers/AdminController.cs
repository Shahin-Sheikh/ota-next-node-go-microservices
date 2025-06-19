using AdminService.Application.Queries;  // Add this for the queries
using AdminService.Application.Commands; // Add this for the commands
using AdminService.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AdminService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminUserDTO>>> GetAll()
    {
        var result = await _mediator.Send(new GetAllAdmins.Query());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminUserDTO>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetAdminById.Query(id));
        return result != null ? Ok(result) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<AdminUserDTO>> Create([FromBody] CreateAdminUserDTO dto)
    {
        var result = await _mediator.Send(new CreateAdmin.Command(dto));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAdminUserDTO dto)
    {
        var result = await _mediator.Send(new UpdateAdmin.Command(id, dto));
        return result ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteAdmin.Command(id));
        return result ? NoContent() : NotFound();
    }
}