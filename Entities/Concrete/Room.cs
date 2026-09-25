using Core.Entities;

namespace Entities.Concrete;

public class Room : IEntity
{
    public int Id { get; set; }
    public string RoomCode { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public int BossId { get; set; }
    public virtual Boss? Boss { get; set; }

    public virtual ICollection<PunchLog> PunchLogs { get; set; } = new List<PunchLog>();
}
