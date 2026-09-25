using Core.Entities;

namespace Entities.Concrete;

public class Boss : IEntity
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string LinkedInUrl { get; set; } = string.Empty;
    public int MaxHp { get; set; } = 5000;
    public int CurrentHp { get; set; } = 5000;
    public bool IsDefeated { get; set; } = false;
    public DateTime? DefeatedAt { get; set; }
    public string QuotesJson { get; set; } = "[\"Agree?\", \"Bunu network'ümle paylaşıyorum!\", \"Sinerjimizi bozdun!\", \"Growth mindset nerede?!\", \"Pazartesi motivasyonu bitti!\", \"B2B SaaS değerleme modelimiz çöktü!\"]";
}
