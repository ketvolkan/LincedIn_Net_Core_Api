using System.Collections.Concurrent;
using Business.Abstract;
using Microsoft.AspNetCore.SignalR;

namespace WebAPI.Hubs;

public class GamePlayer
{
    public string ConnectionId { get; set; } = string.Empty;
    public string RoomCode { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = "#3B82F6";
    public string Gender { get; set; } = "male";
    public float X { get; set; } = 200;
    public float Y { get; set; } = 300;
    public string Facing { get; set; } = "right";
    public int DamageDealt { get; set; }
}

public class ConnectionRateLimit
{
    public long LastMoveTicks;
    public int MoveCountInSecond;
    public long MoveWindowStartTicks;

    public long LastPunchTicks;
    public int PunchCountInSecond;
    public long PunchWindowStartTicks;

    public long LastChatTicks;
}

public class GameHub : Hub
{
    private readonly IBossService _bossService;
    // Thread-safe dictionary storing players by connectionId
    private static readonly ConcurrentDictionary<string, GamePlayer> Players = new();
    // Per-connection rate limit and flood protection state
    private static readonly ConcurrentDictionary<string, ConnectionRateLimit> RateLimits = new();

    public GameHub(IBossService bossService)
    {
        _bossService = bossService;
    }

    public async Task JoinRoom(string roomCode, string playerName, string avatarColor, string gender = "male")
    {
        var cleanName = System.Net.WebUtility.HtmlEncode(playerName?.Trim() ?? string.Empty);
        if (cleanName.Length > 20) cleanName = cleanName[..20];
        if (string.IsNullOrWhiteSpace(cleanName)) cleanName = $"Linççi_{Context.ConnectionId[..4]}";

        var cleanGender = gender?.Trim().ToLowerInvariant() == "female" ? "female" : "male";
        var cleanColor = string.IsNullOrWhiteSpace(avatarColor) || avatarColor.Length > 25 ? "#3B82F6" : avatarColor;

        var player = new GamePlayer
        {
            ConnectionId = Context.ConnectionId,
            RoomCode = roomCode,
            PlayerName = cleanName,
            AvatarColor = cleanColor,
            Gender = cleanGender,
            X = 150 + Random.Shared.Next(0, 100),
            Y = 480 + Random.Shared.Next(0, 80)
        };

        Players[Context.ConnectionId] = player;

        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        // Send list of existing players to newly connected player
        var roomPlayers = Players.Values.Where(p => p.RoomCode == roomCode && p.ConnectionId != Context.ConnectionId).ToList();
        await Clients.Caller.SendAsync("ExistingPlayers", roomPlayers);

        // Notify other players in the room
        await Clients.OthersInGroup(roomCode).SendAsync("PlayerJoined", player);
    }

    public async Task Move(string roomCode, float x, float y, string facing)
    {
        var now = Environment.TickCount64;
        var limit = RateLimits.GetOrAdd(Context.ConnectionId, _ => new ConnectionRateLimit());

        // Flood Protection: Track moves within a 1-second rolling window
        if (now - limit.MoveWindowStartTicks > 1000)
        {
            limit.MoveWindowStartTicks = now;
            limit.MoveCountInSecond = 0;
        }

        limit.MoveCountInSecond++;
        // If a malicious bot/script spams > 40 move requests in 1 second, immediately abort connection
        if (limit.MoveCountInSecond > 40)
        {
            Context.Abort();
            return;
        }

        // Throttle: maximum 1 move broadcast per 45ms (~22 moves/second)
        if (now - limit.LastMoveTicks < 45)
        {
            return; // Silently drop high-frequency sub-tick packets
        }
        limit.LastMoveTicks = now;

        if (Players.TryGetValue(Context.ConnectionId, out var player))
        {
            player.X = Math.Clamp(x, 0, 1600);
            player.Y = Math.Clamp(y, 0, 900);
            player.Facing = facing == "left" ? "left" : "right";

            await Clients.OthersInGroup(roomCode).SendAsync("PlayerMoved", new
            {
                connectionId = Context.ConnectionId,
                x = player.X,
                y = player.Y,
                facing = player.Facing
            });
        }
    }

    public async Task PunchBoss(string roomCode, int roomId, int baseDamage = 35)
    {
        if (!Players.TryGetValue(Context.ConnectionId, out var player))
        {
            return;
        }

        var now = Environment.TickCount64;
        var limit = RateLimits.GetOrAdd(Context.ConnectionId, _ => new ConnectionRateLimit());

        // Flood Protection: Track punches within a 1-second rolling window
        if (now - limit.PunchWindowStartTicks > 1000)
        {
            limit.PunchWindowStartTicks = now;
            limit.PunchCountInSecond = 0;
        }

        limit.PunchCountInSecond++;
        if (limit.PunchCountInSecond > 15) // Maximum 15 punches/sec allowed
        {
            Context.Abort();
            return;
        }

        // Anti-Cheat: Minimum 100ms cooldown between punches (~10 punches/sec max)
        if (now - limit.LastPunchTicks < 100)
        {
            return;
        }
        limit.LastPunchTicks = now;

        // Anti-Cheat: Proximity check (Player must be in the punch zone: Y <= 340)
        if (player.Y > 340)
        {
            return; // Player is too far from the boss to punch
        }

        // Anti-Cheat: Server-Authoritative Damage (Ignore client input! Server generates 30 to 40 base damage)
        int serverDamage = Random.Shared.Next(30, 41);

        var result = await _bossService.PunchBossAsync(roomId, player.PlayerName, serverDamage);

        if (result.Success && result.Data != null)
        {
            player.DamageDealt += result.Data.DamageDealt;

            // Broadcast punch animation and damage to all players in the room
            await Clients.Group(roomCode).SendAsync("BossDamaged", new
            {
                puncherId = Context.ConnectionId,
                puncherName = player.PlayerName,
                damage = result.Data.DamageDealt,
                isCrit = result.Data.IsCrit,
                newHp = result.Data.NewHp,
                maxHp = result.Data.MaxHp,
                isDefeated = result.Data.IsDefeated,
                randomQuote = result.Data.RandomQuote,
                topPunchers = result.Data.TopPunchers
            });
        }
    }

    public async Task SendChatMessage(string roomCode, string message)
    {
        if (string.IsNullOrWhiteSpace(message)) return;

        var now = Environment.TickCount64;
        var limit = RateLimits.GetOrAdd(Context.ConnectionId, _ => new ConnectionRateLimit());
        if (now - limit.LastChatTicks < 400) // Minimum 400ms cooldown between messages
        {
            return;
        }
        limit.LastChatTicks = now;

        var cleanMsg = System.Net.WebUtility.HtmlEncode(message.Trim());
        if (cleanMsg.Length > 100) cleanMsg = cleanMsg[..100];
        if (string.IsNullOrWhiteSpace(cleanMsg)) return;

        if (Players.TryGetValue(Context.ConnectionId, out var player))
        {
            await Clients.Group(roomCode).SendAsync("ChatMessageReceived", new
            {
                playerName = player.PlayerName,
                message = cleanMsg,
                time = DateTime.Now.ToString("HH:mm")
            });
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        RateLimits.TryRemove(Context.ConnectionId, out _);

        if (Players.TryRemove(Context.ConnectionId, out var player))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, player.RoomCode);
            await Clients.OthersInGroup(player.RoomCode).SendAsync("PlayerLeft", Context.ConnectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
