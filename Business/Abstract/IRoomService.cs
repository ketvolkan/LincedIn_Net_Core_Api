using Core.Utilities.Results;
using Entities.DTOs;

namespace Business.Abstract;

public interface IRoomService
{
    Task<IDataResult<List<RoomDetailDto>>> GetActiveRoomsAsync();
    Task<IDataResult<PagedResponseDto<RoomDetailDto>>> GetPagedRoomsAsync(string? search, int pageNumber, int pageSize);
    Task<IDataResult<RoomDetailDto>> GetRoomByCodeAsync(string roomCode);
    Task<IDataResult<RoomDetailDto>> GetRoomByIdAsync(int roomId);
    Task<IDataResult<RoomDetailDto>> CreateRoomAsync(CreateRoomDto createRoomDto);
    Task<IResult> CloseRoomAsync(int roomId);
}
