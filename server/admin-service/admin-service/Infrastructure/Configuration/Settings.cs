namespace AdminService.Infrastructure.Configuration;

public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpiryMinutes { get; set; } = 60;
    public int RefreshTokenExpiryDays { get; set; } = 7;
}

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = string.Empty;
}

public class ApiSettings
{
    public string Title { get; set; } = "Admin Service API";
    public string Version { get; set; } = "v1";
    public string Description { get; set; } = "Admin Service for OTA Microservices";
}
