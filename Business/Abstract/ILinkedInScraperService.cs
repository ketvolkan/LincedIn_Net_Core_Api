using Core.Utilities.Results;
using Entities.DTOs;

namespace Business.Abstract;

public interface ILinkedInScraperService
{
    Task<IDataResult<LinkedInProfileScrapeDto>> ScrapeProfileAsync(string url);
}
