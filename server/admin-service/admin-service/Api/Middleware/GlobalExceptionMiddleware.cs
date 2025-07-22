using Microsoft.AspNetCore.Diagnostics;
using System.Net;

namespace AdminService.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            Success = false,
            Message = "An error occurred while processing your request.",
            Errors = new[] { exception.Message }
        };

        switch (exception)
        {
            case Domain.Exceptions.EntityNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = new
                {
                    Success = false,
                    Message = "Resource not found.",
                    Errors = new[] { exception.Message }
                };
                break;

            case Domain.Exceptions.DuplicateEntityException:
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                response = new
                {
                    Success = false,
                    Message = "Resource already exists.",
                    Errors = new[] { exception.Message }
                };
                break;

            case Domain.Exceptions.ValidationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    Success = false,
                    Message = "Validation failed.",
                    Errors = new[] { exception.Message }
                };
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    Success = false,
                    Message = "Unauthorized access.",
                    Errors = new[] { "You are not authorized to perform this action." }
                };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new
                {
                    Success = false,
                    Message = "An internal server error occurred.",
                    Errors = new[] { "Please try again later or contact support if the problem persists." }
                };
                break;
        }

        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
}
