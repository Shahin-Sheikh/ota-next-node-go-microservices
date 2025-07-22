namespace AdminService.Application.Common;

public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public IEnumerable<string> Errors { get; private set; } = new List<string>();

    private Result(bool isSuccess, T? data, string errorMessage, IEnumerable<string> errors)
    {
        IsSuccess = isSuccess;
        Data = data;
        ErrorMessage = errorMessage;
        Errors = errors;
    }

    public static Result<T> Success(T data) => new(true, data, string.Empty, new List<string>());

    public static Result<T> Failure(string errorMessage) => new(false, default, errorMessage, new List<string>());

    public static Result<T> Failure(IEnumerable<string> errors) => new(false, default, string.Empty, errors);
}

public class Result
{
    public bool IsSuccess { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public IEnumerable<string> Errors { get; private set; } = new List<string>();

    private Result(bool isSuccess, string errorMessage, IEnumerable<string> errors)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
        Errors = errors;
    }

    public static Result Success() => new(true, string.Empty, new List<string>());

    public static Result Failure(string errorMessage) => new(false, errorMessage, new List<string>());

    public static Result Failure(IEnumerable<string> errors) => new(false, string.Empty, errors);
}
