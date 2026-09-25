using System.Net.Http.Headers;
using System.Text;

namespace WebAPI;

public class SwaggerBasicAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public SwaggerBasicAuthMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/swagger"))
        {
            var swaggerUser = _configuration["Swagger:Username"]
                ?? _configuration["SWAGGER_USERNAME"]
                ?? _configuration["Admin:Username"]
                ?? Environment.GetEnvironmentVariable("ADMIN_USERNAME")
                ?? "ketware";

            var swaggerPass = _configuration["Swagger:Password"]
                ?? _configuration["SWAGGER_PASSWORD"]
                ?? _configuration["Admin:Password"]
                ?? Environment.GetEnvironmentVariable("ADMIN_PASSWORD");

            string? authHeader = context.Request.Headers["Authorization"];
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var headerVal = AuthenticationHeaderValue.Parse(authHeader);
                    if (headerVal.Parameter != null)
                    {
                        var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(headerVal.Parameter)).Split(':', 2);
                        if (credentials.Length == 2)
                        {
                            var user = credentials[0];
                            var pass = credentials[1];

                            if (user == swaggerUser && !string.IsNullOrEmpty(swaggerPass) && pass == swaggerPass)
                            {
                                await _next(context);
                                return;
                            }
                        }
                    }
                }
                catch
                {
                    // Invalid format, fall through to 401
                }
            }

            context.Response.Headers.Append("WWW-Authenticate", "Basic realm=\"Lincedin Swagger API Documentation\"");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "text/plain; charset=utf-8";
            await context.Response.WriteAsync("Yetkisiz erişim. Swagger dökümantasyonunu görüntülemek için kullanıcı adı ve şifre gereklidir.");
            return;
        }

        await _next(context);
    }
}
