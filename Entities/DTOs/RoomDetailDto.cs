using Core.Entities;

namespace Entities.DTOs;

public class RoomDetailDto : IDto
{
    public int Id { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public BossDto? Boss { get; set; }
    public List<TopPuncherDto> TopPunchers { get; set; } = new();
    public int TotalPunches { get; set; }
}
