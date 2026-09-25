using Core.Entities;

namespace Entities.DTOs;

public class LinkedInProfileScrapeDto : IDto
{
    public string LinkedInUrl { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}
