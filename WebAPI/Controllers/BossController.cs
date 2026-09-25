using Business.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(IgnoreApi = true)]
public class BossController : ControllerBase
{
    private readonly IBossService _bossService;

    public BossController(IBossService bossService)
    {
        _bossService = bossService;
    }

    [HttpGet("room/{roomId}")]
    public async Task<IActionResult> GetBoss(int roomId)
    {
        var result = await _bossService.GetBossByRoomIdAsync(roomId);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
