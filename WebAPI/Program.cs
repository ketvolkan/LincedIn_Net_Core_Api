using Autofac;
using Autofac.Extensions.DependencyInjection;
using Business.DependencyResolvers.Autofac;
using Core.DependencyResolvers;
using Core.Extensions;
using Core.Utilities.IoC;
using DataAccess.Concrete.EntityFramework.Contexts;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using WebAPI;
using WebAPI.Hubs;

// Load .env file if present (for local development)
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(envPath))
{
    var parentDir = Directory.GetParent(Directory.GetCurrentDirectory())?.FullName;
    if (parentDir != null) envPath = Path.Combine(parentDir, ".env");
}
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
        var parts = trimmed.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var val = parts[1].Trim().Trim('"', '\'');
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
            {
                Environment.SetEnvironmentVariable(key, val);
            }
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// Forwarded Headers for Reverse Proxy (SSL/HTTPS & WebSockets Support)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Autofac Dependency Injection
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    containerBuilder.RegisterModule(new AutofacBusinessModule());
});

// Controllers & Json Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Core Modules
builder.Services.AddDependencyResolvers(new ICoreModule[] {
    new CoreModule()
});

// SignalR Realtime Hub
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// Database Context
var connectionString = builder.Configuration.GetConnectionString("PostgreSQL")
    ?? "Host=localhost;Port=5432;Database=linkedin_boss_battle_db;Username=postgres;Password=1234;Client Encoding=UTF8;";

builder.Services.AddDbContext<BossBattleDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// CORS Policy for Frontend & SignalR WebSockets
var allowedOriginsSetting = builder.Configuration["AllowedOrigins"];
var allowedOrigins = string.IsNullOrWhiteSpace(allowedOriginsSetting)
    ? new[] { "https://lincedin.ketware.com", "http://localhost:39470", "http://localhost:5000", "http://localhost:5173", "http://localhost:8080" }
    : allowedOriginsSetting.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  if (origin.Contains("localhost") || origin.Contains("127.0.0.1") || origin.Contains("lincedin.ketware.com"))
                      return true;
                  return allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LinçedIn API",
        Version = "v1",
        Description = "LinçedIn - Multiplayer 2D LinkedIn Boss Linçleme Oyunu API & SignalR Hub"
    });
});

// Helper function for extracting real client IP
static string GetClientIp(HttpContext httpContext)
{
    return httpContext.Request.Headers["CF-Connecting-IP"].FirstOrDefault()
        ?? httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim()
        ?? httpContext.Connection.RemoteIpAddress?.ToString()
        ?? "unknown-client";
}

// IP-based Rate Limiters (Global DDoS protection + Room creation + Admin brute-force protection)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json; charset=utf-8";
        var msg = "Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.";
        if (context.HttpContext.Request.Path.StartsWithSegments("/api/rooms") && context.HttpContext.Request.Method == "POST")
        {
            msg = "Çok fazla oda oluşturdunuz. Aynı IP adresinden saatte en fazla 5 oda oluşturulabilir.";
        }
        else if (context.HttpContext.Request.Path.StartsWithSegments("/api/admin/login"))
        {
            msg = "Çok fazla hatalı giriş denemesi yapıldı. Lütfen 10 dakika sonra tekrar deneyin.";
        }

        var responseObj = new
        {
            success = false,
            message = msg,
            data = (object?)null
        };
        await context.HttpContext.Response.WriteAsJsonAsync(responseObj, cancellationToken: token);
    };

    // 1. Global Rate Limit (Bypasses GET requests and SignalR so browsing rooms is never blocked)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        if (HttpMethods.IsGet(httpContext.Request.Method) ||
            HttpMethods.IsHead(httpContext.Request.Method) ||
            HttpMethods.IsOptions(httpContext.Request.Method) ||
            httpContext.Request.Path.StartsWithSegments("/gamehub"))
        {
            return RateLimitPartition.GetNoLimiter<string>("no_limit");
        }

        var ip = GetClientIp(httpContext);
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: $"global_{ip}",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 150,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueLimit = 0
            });
    });

    // 2. Room Creation Limit (5 rooms per hour per IP)
    options.AddPolicy("RoomCreationRateLimit", httpContext =>
    {
        var ip = GetClientIp(httpContext);
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: $"room_{ip}",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromHours(1),
                SegmentsPerWindow = 6,
                QueueLimit = 0
            });
    });

    // 3. Admin Login Brute Force Protection (5 attempts per 10 minutes per IP)
    options.AddPolicy("AdminLoginRateLimit", httpContext =>
    {
        var ip = GetClientIp(httpContext);
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: $"admin_login_{ip}",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(10),
                SegmentsPerWindow = 5,
                QueueLimit = 0
            });
    });
});

var app = builder.Build();

app.UseForwardedHeaders();

// Security Headers Middleware (Clickjacking, MIME Sniffing, XSS protection)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// Auto Database Migration / Seeding
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<BossBattleDbContext>();
        await DbInitializer.SeedAsync(db, app.Configuration);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB INIT] Veritabanı başlatılırken hata oluştu: {ex.Message}");
    }
}

// Swagger Basic Authentication Protection (Requires Admin credentials)
app.UseMiddleware<SwaggerBasicAuthMiddleware>();

// Pipeline Configuration
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LinkedIn Boss Battle API v1");
    });
}

app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseRateLimiter();

app.MapControllers();
app.MapHub<GameHub>("/gamehub");
app.MapFallbackToFile("index.html");

app.Run();
