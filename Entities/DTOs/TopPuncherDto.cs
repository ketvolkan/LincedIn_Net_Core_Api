using Core.Entities;

namespace Entities.DTOs;

public class TopPuncherDto : IDto
{
    public string PlayerName { get; set; } = string.Empty;
    public int TotalDamage { get; set; }
    public int PunchCount { get; set; }
}
