using System.Text.Json;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using Core.Utilities.Security;
using DataAccess.Abstract;
using Entities.DTOs;
using Microsoft.Extensions.Configuration;

namespace Business.Concrete;

public class AdminManager : IAdminService
{
    private readonly IAdminUserDal _adminUserDal;
    private readonly IRoomDal _roomDal;
    private readonly IBossDal _bossDal;
    private readonly IPunchLogDal _punchLogDal;
    private readonly IConfiguration _configuration;

    public AdminManager(
        IAdminUserDal adminUserDal,
        IRoomDal roomDal,
        IBossDal bossDal,
        IPunchLogDal punchLogDal,
        IConfiguration configuration)
    {
        _adminUserDal = adminUserDal;
        _roomDal = roomDal;
        _bossDal = bossDal;
        _punchLogDal = punchLogDal;
        _configuration = configuration;
    }

    public async Task<IDataResult<AdminLoginResponseDto>> LoginAsync(AdminLoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.Username) || string.IsNullOrWhiteSpace(loginDto.Password))
        {
            return new ErrorDataResult<AdminLoginResponseDto>("Kullanıcı adı ve şifre zorunludur.");
        }

        // Cloudflare Turnstile Captcha Verification
        var turnstileSecret = _configuration["Turnstile:SecretKey"]
            ?? _configuration["TURNSTILE_SECRET_KEY"]
            ?? Environment.GetEnvironmentVariable("TURNSTILE_SECRET_KEY");

        if (!string.IsNullOrWhiteSpace(turnstileSecret))
        {
            if (string.IsNullOrWhiteSpace(loginDto.CaptchaToken))
            {
                return new ErrorDataResult<AdminLoginResponseDto>("Lütfen güvenlik doğrulamasını (Captcha) tamamlayın.");
            }

            var isCaptchaValid = await ValidateTurnstileTokenAsync(loginDto.CaptchaToken, turnstileSecret);
            if (!isCaptchaValid)
            {
                return new ErrorDataResult<AdminLoginResponseDto>("Güvenlik doğrulaması (Captcha) başarısız oldu. Lütfen tekrar deneyin.");
            }
        }

        var normalizedUsername = loginDto.Username.Trim().ToLowerInvariant();
        var user = await _adminUserDal.GetAsync(u => u.Username.ToLower() == normalizedUsername);

        if (user == null)
        {
            return new ErrorDataResult<AdminLoginResponseDto>("Kullanıcı adı veya şifre hatalı.");
        }

        var isValid = HashingHelper.VerifyPasswordHash(loginDto.Password, user.PasswordHash, user.PasswordSalt);
        if (!isValid)
        {
            return new ErrorDataResult<AdminLoginResponseDto>("Kullanıcı adı veya şifre hatalı.");
        }

        var secret = _configuration["Admin:JwtSecret"]
            ?? _configuration["ADMIN_JWT_SECRET"]
            ?? "Lincedin_Ketware_Admin_Secure_Secret_Key_2026_Long_Entropy!";

        var validity = TimeSpan.FromDays(7);
        var token = TokenHelper.CreateToken(user.Username, secret, validity);

        user.LastLoginAt = DateTime.UtcNow;
        await _adminUserDal.UpdateAsync(user);

        return new SuccessDataResult<AdminLoginResponseDto>(new AdminLoginResponseDto
        {
            Token = token,
            Username = user.Username,
            ExpiresAt = DateTime.UtcNow.Add(validity)
        }, "Giriş başarılı.");
    }

    public async Task<IDataResult<AdminStatsDto>> GetStatsAsync()
    {
        var allRooms = await _roomDal.GetAllAsync();
        var allBosses = await _bossDal.GetAllAsync();
        var allLogs = await _punchLogDal.GetAllAsync();

        var stats = new AdminStatsDto
        {
            TotalRooms = allRooms.Count,
            ActiveRooms = allRooms.Count(r => r.IsActive),
            DefeatedBosses = allBosses.Count(b => b.IsDefeated),
            TotalPunches = allLogs.Count
        };

        return new SuccessDataResult<AdminStatsDto>(stats);
    }

    public async Task<IDataResult<PagedResponseDto<RoomDetailDto>>> GetAllRoomsAsync(string? search, int pageNumber, int pageSize)
    {
        var (rooms, totalCount) = await _roomDal.GetPagedRoomsAsync(search, pageNumber, pageSize);
        var dtos = new List<RoomDetailDto>();

        foreach (var room in rooms)
        {
            var detail = new RoomDetailDto
            {
                Id = room.Id,
                RoomCode = room.RoomCode,
                Title = room.Title,
                Description = room.Description,
                CreatedAt = room.CreatedAt,
                IsActive = room.IsActive
            };

            if (room.Boss != null)
            {
                detail.Boss = new BossDto
                {
                    Id = room.Boss.Id,
                    FullName = room.Boss.FullName,
                    Headline = room.Boss.Headline,
                    AvatarUrl = room.Boss.AvatarUrl,
                    LinkedInUrl = room.Boss.LinkedInUrl,
                    MaxHp = room.Boss.MaxHp,
                    CurrentHp = room.Boss.CurrentHp,
                    IsDefeated = room.Boss.IsDefeated
                };
            }

            detail.TotalPunches = room.PunchLogs?.Count ?? 0;
            dtos.Add(detail);
        }

        var response = new PagedResponseDto<RoomDetailDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber < 1 ? 1 : pageNumber,
            PageSize = pageSize < 1 ? 10 : pageSize
        };

        return new SuccessDataResult<PagedResponseDto<RoomDetailDto>>(response);
    }

    public async Task<IResult> DeleteRoomAsync(int roomId)
    {
        var room = await _roomDal.GetAsync(r => r.Id == roomId);
        if (room == null)
        {
            return new ErrorResult("Oda bulunamadı.");
        }

        // Delete room (cascade will remove punch logs, and we can delete the boss if orphan)
        var bossId = room.BossId;
        await _roomDal.DeleteAsync(room);

        var boss = await _bossDal.GetAsync(b => b.Id == bossId);
        if (boss != null)
        {
            await _bossDal.DeleteAsync(boss);
        }

        return new SuccessResult("Oda ve ilgili veriler başarıyla silindi.");
    }

    private static async Task<bool> ValidateTurnstileTokenAsync(string token, string secretKey)
    {
        try
        {
            using var client = new HttpClient();
            var postData = new Dictionary<string, string>
            {
                { "secret", secretKey },
                { "response", token }
            };

            using var content = new FormUrlEncodedContent(postData);
            var response = await client.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("success", out var successProp))
            {
                return successProp.GetBoolean();
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
}
