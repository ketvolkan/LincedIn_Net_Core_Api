using Core.Utilities.Results;
using Entities.DTOs;

namespace Business.Abstract;

public interface IAdminService
{
    Task<IDataResult<AdminLoginResponseDto>> LoginAsync(AdminLoginDto loginDto);
    Task<IDataResult<AdminStatsDto>> GetStatsAsync();
    Task<IDataResult<PagedResponseDto<RoomDetailDto>>> GetAllRoomsAsync(string? search, int pageNumber, int pageSize);
    Task<IResult> DeleteRoomAsync(int roomId);
}
