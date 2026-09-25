using System.Text.Json;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Concrete;

public class BossManager : IBossService
{
    private readonly IBossDal _bossDal;
    private readonly IRoomDal _roomDal;
    private readonly IPunchLogDal _punchLogDal;
    private static readonly Random Random = new();

    public BossManager(IBossDal bossDal, IRoomDal roomDal, IPunchLogDal punchLogDal)
    {
        _bossDal = bossDal;
        _roomDal = roomDal;
        _punchLogDal = punchLogDal;
    }

    public async Task<IDataResult<PunchResultDto>> PunchBossAsync(int roomId, string playerName, int damage)
    {
        var room = await _roomDal.GetRoomWithDetailsAsync(roomId);
        if (room == null || room.Boss == null)
        {
            return new ErrorDataResult<PunchResultDto>(Messages.BossNotFound);
        }

        var boss = room.Boss;

        if (boss.IsDefeated)
        {
            return new ErrorDataResult<PunchResultDto>(new PunchResultDto
            {
                BossId = boss.Id,
                NewHp = 0,
                MaxHp = boss.MaxHp,
                IsDefeated = true,
                PuncherName = playerName,
                TopPunchers = await _punchLogDal.GetTopPunchersByRoomAsync(roomId, 5)
            }, Messages.BossAlreadyDefeated);
        }

        // Anti-Cheat: Regardless of caller input, clamp base damage strictly to legal range (20 to 45)
        int safeBaseDamage = Math.Clamp(damage > 0 ? damage : 35, 20, 45);

        // Random critical hit chance (15%)
        bool isCrit = Random.Next(1, 101) <= 15;
        int calculatedDamage = isCrit ? safeBaseDamage * 2 : safeBaseDamage;

        boss.CurrentHp = Math.Max(0, boss.CurrentHp - calculatedDamage);

        if (boss.CurrentHp == 0 && !boss.IsDefeated)
        {
            boss.IsDefeated = true;
            boss.DefeatedAt = DateTime.UtcNow;
        }

        await _bossDal.UpdateAsync(boss);

        // Record punch log
        var log = new PunchLog
        {
            RoomId = roomId,
            PlayerName = string.IsNullOrWhiteSpace(playerName) ? "Anonim Linççi" : playerName,
            Damage = calculatedDamage,
            IsCrit = isCrit,
            CreatedAt = DateTime.UtcNow
        };
        await _punchLogDal.AddAsync(log);

        // Pick random quote
        var quotes = string.IsNullOrEmpty(boss.QuotesJson)
            ? new List<string> { "Agree?", "Networküme darbe vurdun!", "Sinerjimiz bitti!" }
            : JsonSerializer.Deserialize<List<string>>(boss.QuotesJson) ?? new List<string> { "Agree?" };
        string randomQuote = quotes.Count > 0 ? quotes[Random.Next(quotes.Count)] : "Ouch!";

        var topPunchers = await _punchLogDal.GetTopPunchersByRoomAsync(roomId, 5);

        var result = new PunchResultDto
        {
            BossId = boss.Id,
            NewHp = boss.CurrentHp,
            MaxHp = boss.MaxHp,
            DamageDealt = calculatedDamage,
            IsCrit = isCrit,
            IsDefeated = boss.IsDefeated,
            PuncherName = log.PlayerName,
            RandomQuote = randomQuote,
            TopPunchers = topPunchers
        };

        var message = boss.IsDefeated ? Messages.BossDefeated : Messages.BossDamaged;
        return new SuccessDataResult<PunchResultDto>(result, message);
    }

    public async Task<IDataResult<BossDto>> GetBossByRoomIdAsync(int roomId)
    {
        var room = await _roomDal.GetRoomWithDetailsAsync(roomId);
        if (room == null || room.Boss == null)
        {
            return new ErrorDataResult<BossDto>(Messages.BossNotFound);
        }

        var quotes = string.IsNullOrEmpty(room.Boss.QuotesJson)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(room.Boss.QuotesJson) ?? new List<string>();

        var dto = new BossDto
        {
            Id = room.Boss.Id,
            FullName = room.Boss.FullName,
            Headline = room.Boss.Headline,
            AvatarUrl = room.Boss.AvatarUrl,
            LinkedInUrl = room.Boss.LinkedInUrl,
            MaxHp = room.Boss.MaxHp,
            CurrentHp = room.Boss.CurrentHp,
            IsDefeated = room.Boss.IsDefeated,
            Quotes = quotes
        };

        return new SuccessDataResult<BossDto>(dto);
    }
}
