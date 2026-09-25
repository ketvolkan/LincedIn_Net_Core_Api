using System.Text.Json;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Concrete;

public class RoomManager : IRoomService
{
    private readonly IRoomDal _roomDal;
    private readonly IBossDal _bossDal;
    private readonly IPunchLogDal _punchLogDal;

    public RoomManager(IRoomDal roomDal, IBossDal bossDal, IPunchLogDal punchLogDal)
    {
        _roomDal = roomDal;
        _bossDal = bossDal;
        _punchLogDal = punchLogDal;
    }

    public async Task<IDataResult<List<RoomDetailDto>>> GetActiveRoomsAsync()
    {
        var rooms = await _roomDal.GetActiveRoomsWithBossAsync();
        var dtos = new List<RoomDetailDto>();

        foreach (var room in rooms)
        {
            dtos.Add(MapToRoomDetail(room));
        }

        return new SuccessDataResult<List<RoomDetailDto>>(dtos, Messages.RoomsListed);
    }

    public async Task<IDataResult<PagedResponseDto<RoomDetailDto>>> GetPagedRoomsAsync(string? search, int pageNumber, int pageSize)
    {
        var (rooms, totalCount) = await _roomDal.GetPagedRoomsAsync(search, pageNumber, pageSize, activeOnly: true);
        var dtos = new List<RoomDetailDto>();

        foreach (var room in rooms)
        {
            dtos.Add(MapToRoomDetail(room));
        }

        var response = new PagedResponseDto<RoomDetailDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber < 1 ? 1 : pageNumber,
            PageSize = pageSize < 1 ? 6 : pageSize
        };

        return new SuccessDataResult<PagedResponseDto<RoomDetailDto>>(response, Messages.RoomsListed);
    }

    public async Task<IDataResult<RoomDetailDto>> GetRoomByCodeAsync(string roomCode)
    {
        var room = await _roomDal.GetRoomByCodeWithDetailsAsync(roomCode);
        if (room == null)
        {
            return new ErrorDataResult<RoomDetailDto>(Messages.RoomNotFound);
        }

        var detail = MapToRoomDetail(room);
        detail.TopPunchers = await _punchLogDal.GetTopPunchersByRoomAsync(room.Id, 5);
        return new SuccessDataResult<RoomDetailDto>(detail);
    }

    public async Task<IDataResult<RoomDetailDto>> GetRoomByIdAsync(int roomId)
    {
        var room = await _roomDal.GetRoomWithDetailsAsync(roomId);
        if (room == null)
        {
            return new ErrorDataResult<RoomDetailDto>(Messages.RoomNotFound);
        }

        var detail = MapToRoomDetail(room);
        detail.TopPunchers = await _punchLogDal.GetTopPunchersByRoomAsync(room.Id, 5);
        return new SuccessDataResult<RoomDetailDto>(detail);
    }

    private static string SanitizeInput(string? input, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var clean = input.Trim().Replace("<", "").Replace(">", "");
        return clean.Length > maxLength ? clean[..maxLength] : clean;
    }

    public async Task<IDataResult<RoomDetailDto>> CreateRoomAsync(CreateRoomDto createRoomDto)
    {
        var cleanFullName = SanitizeInput(createRoomDto.FullName, 50);
        if (string.IsNullOrWhiteSpace(cleanFullName)) cleanFullName = "Anonim Boss";

        var cleanTitle = SanitizeInput(createRoomDto.Title, 80);
        if (string.IsNullOrWhiteSpace(cleanTitle)) cleanTitle = $"{cleanFullName} Lincleme Odası";

        var cleanDesc = SanitizeInput(createRoomDto.Description, 200);
        if (string.IsNullOrWhiteSpace(cleanDesc)) cleanDesc = "Toplanın linçliyoruz!";

        var clampedHp = Math.Clamp(createRoomDto.MaxHp > 0 ? createRoomDto.MaxHp : 50000, 1000, 1000000);

        var boss = new Boss
        {
            FullName = cleanFullName,
            Headline = string.IsNullOrWhiteSpace(createRoomDto.Headline) ? "LinkedIn Thought Leader" : createRoomDto.Headline[..Math.Min(100, createRoomDto.Headline.Length)],
            AvatarUrl = string.IsNullOrWhiteSpace(createRoomDto.AvatarUrl)
                ? $"https://api.dicebear.com/7.x/bottts/svg?seed={Uri.EscapeDataString(cleanFullName)}"
                : (createRoomDto.AvatarUrl.Length > 500 ? createRoomDto.AvatarUrl[..500] : createRoomDto.AvatarUrl),
            LinkedInUrl = string.IsNullOrWhiteSpace(createRoomDto.LinkedInUrl) ? "" : createRoomDto.LinkedInUrl[..Math.Min(250, createRoomDto.LinkedInUrl.Length)],
            MaxHp = clampedHp,
            CurrentHp = clampedHp,
            IsDefeated = false
        };

        await _bossDal.AddAsync(boss);

        var room = new Room
        {
            Title = cleanTitle,
            Description = cleanDesc,
            BossId = boss.Id,
            Boss = boss,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _roomDal.AddAsync(room);

        var detail = MapToRoomDetail(room);
        return new SuccessDataResult<RoomDetailDto>(detail, Messages.RoomCreated);
    }

    public async Task<IResult> CloseRoomAsync(int roomId)
    {
        var room = await _roomDal.GetAsync(r => r.Id == roomId);
        if (room == null)
        {
            return new ErrorResult(Messages.RoomNotFound);
        }

        room.IsActive = false;
        await _roomDal.UpdateAsync(room);
        return new SuccessResult(Messages.RoomClosed);
    }

    private static RoomDetailDto MapToRoomDetail(Room room)
    {
        var bossDto = room.Boss != null ? new BossDto
        {
            Id = room.Boss.Id,
            FullName = room.Boss.FullName,
            Headline = room.Boss.Headline,
            AvatarUrl = room.Boss.AvatarUrl,
            LinkedInUrl = room.Boss.LinkedInUrl,
            MaxHp = room.Boss.MaxHp,
            CurrentHp = room.Boss.CurrentHp,
            IsDefeated = room.Boss.IsDefeated,
            Quotes = string.IsNullOrEmpty(room.Boss.QuotesJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(room.Boss.QuotesJson) ?? new List<string>()
        } : null;

        return new RoomDetailDto
        {
            Id = room.Id,
            RoomCode = room.RoomCode,
            Title = room.Title,
            Description = room.Description,
            CreatedAt = room.CreatedAt,
            IsActive = room.IsActive,
            Boss = bossDto,
            TotalPunches = room.PunchLogs?.Count ?? 0
        };
    }
}
