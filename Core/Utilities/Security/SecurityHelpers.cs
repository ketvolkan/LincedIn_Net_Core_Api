using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Core.Utilities.Security;

public static class HashingHelper
{
    public static void CreatePasswordHash(string password, out string passwordHash, out string passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = Convert.ToBase64String(hmac.Key);
        passwordHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
    }

    public static bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
    {
        try
        {
            var saltBytes = Convert.FromBase64String(storedSalt);
            var hashBytes = Convert.FromBase64String(storedHash);

            using var hmac = new HMACSHA512(saltBytes);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            return CryptographicOperations.FixedTimeEquals(computedHash, hashBytes);
        }
        catch
        {
            return false;
        }
    }
}

public class AdminTokenPayload
{
    public string Username { get; set; } = string.Empty;
    public long ExpireEpoch { get; set; }
}

public static class TokenHelper
{
    public static string CreateToken(string username, string secretKey, TimeSpan validity)
    {
        var payload = new AdminTokenPayload
        {
            Username = username,
            ExpireEpoch = DateTimeOffset.UtcNow.Add(validity).ToUnixTimeSeconds()
        };

        var json = JsonSerializer.Serialize(payload);
        var payloadBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadBase64)));

        return $"{payloadBase64}.{signature}";
    }

    public static bool ValidateToken(string? token, string secretKey, out string? username)
    {
        username = null;
        if (string.IsNullOrWhiteSpace(token)) return false;

        var parts = token.Split('.');
        if (parts.Length != 2) return false;

        var payloadBase64 = parts[0];
        var signature = parts[1];

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var expectedSig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadBase64)));

        if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(signature), Encoding.UTF8.GetBytes(expectedSig)))
            return false;

        try
        {
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
            var payload = JsonSerializer.Deserialize<AdminTokenPayload>(json);
            if (payload == null) return false;

            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > payload.ExpireEpoch)
                return false;

            username = payload.Username;
            return true;
        }
        catch
        {
            return false;
        }
    }
}
