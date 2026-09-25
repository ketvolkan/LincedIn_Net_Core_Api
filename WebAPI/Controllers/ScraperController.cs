using Business.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(IgnoreApi = true)]
public class ScraperController : ControllerBase
{
    private readonly ILinkedInScraperService _scraperService;

    public ScraperController(ILinkedInScraperService scraperService)
    {
        _scraperService = scraperService;
    }

    [HttpPost("linkedin")]
    public async Task<IActionResult> ScrapeLinkedIn([FromBody] ScrapeRequest request)
    {
        var result = await _scraperService.ScrapeProfileAsync(request.Url);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

public class ScrapeRequest
{
    public string Url { get; set; } = string.Empty;
}
