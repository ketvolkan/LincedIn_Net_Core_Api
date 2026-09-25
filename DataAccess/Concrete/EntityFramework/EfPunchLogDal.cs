using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework.Contexts;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework;

public class EfPunchLogDal : EfEntityRepositoryBase<PunchLog, BossBattleDbContext>, IPunchLogDal
{
    public EfPunchLogDal(BossBattleDbContext context) : base(context)
    {
    }

    public async Task<List<TopPuncherDto>> GetTopPunchersByRoomAsync(int roomId, int count = 5)
    {
        return await Context.PunchLogs
            .Where(p => p.RoomId == roomId)
            .GroupBy(p => p.PlayerName)
            .Select(g => new TopPuncherDto
            {
                PlayerName = g.Key,
                TotalDamage = g.Sum(x => x.Damage),
                PunchCount = g.Count()
            })
            .OrderByDescending(x => x.TotalDamage)
            .Take(count)
            .ToListAsync();
    }
}
