using Core.Entities;
using Core.Utilities.Results;
using Entities.DTOs;

namespace Business.Abstract;

public interface IBossService
{
    Task<IDataResult<PunchResultDto>> PunchBossAsync(int roomId, string playerName, int damage);
    Task<IDataResult<BossDto>> GetBossByRoomIdAsync(int roomId);
}

public class PunchResultDto : IDto
{
    public int BossId { get; set; }
    public int NewHp { get; set; }
    public int MaxHp { get; set; }
    public int DamageDealt { get; set; }
    public bool IsCrit { get; set; }
    public bool IsDefeated { get; set; }
    public string PuncherName { get; set; } = string.Empty;
    public string RandomQuote { get; set; } = string.Empty;
    public List<TopPuncherDto> TopPunchers { get; set; } = new();
}
