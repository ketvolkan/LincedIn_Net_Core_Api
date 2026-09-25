using Core.Entities;

namespace Entities.DTOs;

public class BossDto : IDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string LinkedInUrl { get; set; } = string.Empty;
    public int MaxHp { get; set; }
    public int CurrentHp { get; set; }
    public bool IsDefeated { get; set; }
    public List<string> Quotes { get; set; } = new();
}
