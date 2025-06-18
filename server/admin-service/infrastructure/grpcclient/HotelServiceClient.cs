public interface IHotelServiceClient
{
    Task<IEnumerable<HotelDto>> GetHotelsAsync();
}

public class HotelServiceClient : IHotelServiceClient
{
    private readonly HotelGrpc.HotelGrpcClient _client;

    public HotelServiceClient(HotelGrpc.HotelGrpcClient client)
    {
        _client = client;
    }

    public async Task<IEnumerable<HotelDto>> GetHotelsAsync()
    {
        var response = await _client.GetAllHotelsAsync(new Empty());
        return response.Hotels.Select(h => new HotelDto
        {
            Id = Guid.Parse(h.Id),
            Name = h.Name,
            IsActive = h.IsActive
        });
    }
}
