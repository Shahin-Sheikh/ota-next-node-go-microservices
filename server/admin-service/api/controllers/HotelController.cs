[ApiController]
[Route("api/[controller]")]
public class HotelController : ControllerBase
{
    private readonly IHotelServiceClient _hotelService;

    public HotelController(IHotelServiceClient hotelService)
    {
        _hotelService = hotelService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var hotels = await _hotelService.GetHotelsAsync();
        return Ok(hotels);
    }
}
