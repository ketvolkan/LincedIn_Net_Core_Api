using Core.Entities;

namespace Entities.Concrete;

public class PunchLog : IEntity
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public virtual Room? Room { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public int Damage { get; set; }
    public bool IsCrit { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
