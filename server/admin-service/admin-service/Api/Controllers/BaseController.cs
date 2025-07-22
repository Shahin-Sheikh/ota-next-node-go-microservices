using Microsoft.AspNetCore.Mvc;

namespace AdminService.Api.Controllers;

[ApiController]
[Route("api/v1")]
public abstract class BaseController : ControllerBase
{
    protected IActionResult HandleResult<T>(Application.Common.Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse<T>
            {
                Success = true,
                Data = result.Data,
                Message = "Operation completed successfully"
            });
        }

        var errors = result.Errors?.Any() == true ? result.Errors : new[] { result.ErrorMessage };
        return BadRequest(new ApiResponse<T>
        {
            Success = false,
            Errors = errors,
            Message = "Operation failed"
        });
    }

    protected IActionResult HandleResult(Application.Common.Result result)
    {
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse
            {
                Success = true,
                Message = "Operation completed successfully"
            });
        }

        var errors = result.Errors?.Any() == true ? result.Errors : new[] { result.ErrorMessage };
        return BadRequest(new ApiResponse
        {
            Success = false,
            Errors = errors,
            Message = "Operation failed"
        });
    }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string> Errors { get; set; } = new List<string>();
}

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string> Errors { get; set; } = new List<string>();
}
