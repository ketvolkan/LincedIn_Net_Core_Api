using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework.Contexts;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework;

public class EfRoomDal : EfEntityRepositoryBase<Room, BossBattleDbContext>, IRoomDal
{
    public EfRoomDal(BossBattleDbContext context) : base(context)
    {
    }

    public async Task<Room?> GetRoomWithDetailsAsync(int roomId)
    {
        return await Context.Rooms
            .Include(r => r.Boss)
            .Include(r => r.PunchLogs)
            .FirstOrDefaultAsync(r => r.Id == roomId);
    }

    public async Task<Room?> GetRoomByCodeWithDetailsAsync(string roomCode)
    {
        return await Context.Rooms
            .Include(r => r.Boss)
            .Include(r => r.PunchLogs)
            .FirstOrDefaultAsync(r => r.RoomCode == roomCode);
    }

    public async Task<List<Room>> GetActiveRoomsWithBossAsync()
    {
        return await Context.Rooms
            .Where(r => r.IsActive)
            .Include(r => r.Boss)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<(List<Room> Items, int TotalCount)> GetPagedRoomsAsync(string? search, int pageNumber, int pageSize, bool? activeOnly = null)
    {
        var query = Context.Rooms
            .Include(r => r.Boss)
            .Include(r => r.PunchLogs)
            .AsQueryable();

        if (activeOnly.HasValue)
        {
            query = query.Where(r => r.IsActive == activeOnly.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(s) ||
                r.RoomCode.ToLower().Contains(s) ||
                (r.Boss != null && (r.Boss.FullName.ToLower().Contains(s) || r.Boss.Headline.ToLower().Contains(s))));
        }

        var totalCount = await query.CountAsync();

        var page = pageNumber < 1 ? 1 : pageNumber;
        var size = pageSize < 1 ? 6 : pageSize;

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return (items, totalCount);
    }
}
