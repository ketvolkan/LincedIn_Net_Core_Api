using Business.Abstract;
using Entities.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    [DisableRateLimiting]
    public async Task<IActionResult> GetRooms([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 6)
    {
        var result = await _roomService.GetPagedRoomsAsync(search, page, pageSize);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{roomCode}")]
    [DisableRateLimiting]
    public async Task<IActionResult> GetRoomByCode(string roomCode)
    {
        var result = await _roomService.GetRoomByCodeAsync(roomCode);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("id/{id}")]
    [DisableRateLimiting]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var result = await _roomService.GetRoomByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [EnableRateLimiting("RoomCreationRateLimit")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto createRoomDto)
    {
        var result = await _roomService.CreateRoomAsync(createRoomDto);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
