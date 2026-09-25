using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;

namespace DataAccess.Abstract;

public interface IPunchLogDal : IEntityRepository<PunchLog>
{
    Task<List<TopPuncherDto>> GetTopPunchersByRoomAsync(int roomId, int count = 5);
}
