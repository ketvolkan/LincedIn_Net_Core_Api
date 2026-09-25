using Business.Abstract;
using Core.Utilities.Security;
using Entities.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IConfiguration _configuration;

    public AdminController(IAdminService adminService, IConfiguration configuration)
    {
        _adminService = adminService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [EnableRateLimiting("AdminLoginRateLimit")]
    public async Task<IActionResult> Login([FromBody] AdminLoginDto loginDto)
    {
        var result = await _adminService.LoginAsync(loginDto);
        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!IsAuthorized(out _))
        {
            return Unauthorized(new { success = false, message = "Yetkisiz erişim. Lütfen giriş yapın." });
        }

        var result = await _adminService.GetStatsAsync();
        return Ok(result);
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> GetRooms([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (!IsAuthorized(out _))
        {
            return Unauthorized(new { success = false, message = "Yetkisiz erişim. Lütfen giriş yapın." });
        }

        var result = await _adminService.GetAllRoomsAsync(search, page, pageSize);
        return Ok(result);
    }

    [HttpDelete("rooms/{id}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        if (!IsAuthorized(out _))
        {
            return Unauthorized(new { success = false, message = "Yetkisiz erişim. Lütfen giriş yapın." });
        }

        var result = await _adminService.DeleteRoomAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    private bool IsAuthorized(out string? username)
    {
        username = null;
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        var secret = _configuration["Admin:JwtSecret"]
            ?? _configuration["ADMIN_JWT_SECRET"]
            ?? "Lincedin_Ketware_Admin_Secure_Secret_Key_2026_Long_Entropy!";

        return TokenHelper.ValidateToken(token, secret, out username);
    }
}
