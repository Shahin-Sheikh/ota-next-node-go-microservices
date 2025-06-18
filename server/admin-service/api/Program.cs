var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddGrpc(); // if this service also exposes gRPC

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Layered services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseAuthorization();

app.MapControllers(); // HTTP
app.MapGrpcService<GrpcAdminService>(); // gRPC endpoint (optional)

app.Run();
