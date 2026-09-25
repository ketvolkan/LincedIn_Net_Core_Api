using Core.DataAccess;
using Entities.Concrete;

namespace DataAccess.Abstract;

public interface IRoomDal : IEntityRepository<Room>
{
    Task<Room?> GetRoomWithDetailsAsync(int roomId);
    Task<Room?> GetRoomByCodeWithDetailsAsync(string roomCode);
    Task<List<Room>> GetActiveRoomsWithBossAsync();
    Task<(List<Room> Items, int TotalCount)> GetPagedRoomsAsync(string? search, int pageNumber, int pageSize, bool? activeOnly = null);
}
