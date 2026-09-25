using System.ComponentModel.DataAnnotations;
using Core.Entities;

namespace Entities.DTOs;

public class AdminLoginDto : IDto
{
    [Required(ErrorMessage = "Kullanıcı adı zorunludur.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Kullanıcı adı 2 ile 50 karakter arasında olmalıdır.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [StringLength(100, MinimumLength = 4, ErrorMessage = "Şifre en az 4 karakter olmalıdır.")]
    public string Password { get; set; } = string.Empty;

    public string? CaptchaToken { get; set; }
}

public class AdminLoginResponseDto : IDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class AdminStatsDto : IDto
{
    public int TotalRooms { get; set; }
    public int ActiveRooms { get; set; }
    public int DefeatedBosses { get; set; }
    public int TotalPunches { get; set; }
}
