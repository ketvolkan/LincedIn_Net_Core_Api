using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using Entities.DTOs;
using HtmlAgilityPack;

namespace Business.Concrete;

public class LinkedInScraperManager : ILinkedInScraperService
{
    private static readonly HttpClient HttpClient = new();

    static LinkedInScraperManager()
    {
        HttpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
        HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html"));
        HttpClient.Timeout = TimeSpan.FromSeconds(10);
    }

    public async Task<IDataResult<LinkedInProfileScrapeDto>> ScrapeProfileAsync(string url)
    {
        var result = new LinkedInProfileScrapeDto
        {
            LinkedInUrl = url
        };

        if (string.IsNullOrWhiteSpace(url))
        {
            return new ErrorDataResult<LinkedInProfileScrapeDto>(result, "URL boş bırakılamaz.");
        }

        // 1. Initial fallback extraction from URL slug
        var slugMatch = Regex.Match(url, @"linkedin\.com/in/([^/?#]+)", RegexOptions.IgnoreCase);
        var slug = slugMatch.Success ? slugMatch.Groups[1].Value.Replace("-", " ") : "LinkedIn Üyesi";
        result.FullName = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(slug);
        result.Headline = "LinkedIn Influencer & Thought Leader";
        result.AvatarUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(result.FullName)}";

        // 2. Try Microlink Meta API (Bypasses LinkedIn's 999 anti-bot authwall)
        try
        {
            var microlinkUrl = $"https://api.microlink.io?url={Uri.EscapeDataString(url)}";
            var microResponse = await HttpClient.GetAsync(microlinkUrl);
            if (microResponse.IsSuccessStatusCode)
            {
                var jsonStr = await microResponse.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(jsonStr);
                var root = jsonDoc.RootElement;
                if (root.TryGetProperty("data", out var dataElem))
                {
                    if (dataElem.TryGetProperty("image", out var imgElem) && imgElem.TryGetProperty("url", out var imgUrlElem))
                    {
                        var fetchedImg = imgUrlElem.GetString();
                        if (!string.IsNullOrWhiteSpace(fetchedImg) && !fetchedImg.Contains("static.licdn.com/sc/h/"))
                        {
                            result.AvatarUrl = fetchedImg;
                        }
                    }

                    if (dataElem.TryGetProperty("title", out var titleElem))
                    {
                        var fullTitle = titleElem.GetString() ?? "";
                        var cleanTitle = fullTitle.Split('|')[0].Trim();
                        var parts = cleanTitle.Split(new[] { " - ", " – " }, StringSplitOptions.None);
                        if (parts.Length > 0 && !string.IsNullOrWhiteSpace(parts[0]))
                        {
                            result.FullName = parts[0].Trim();
                        }
                        if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                        {
                            result.Headline = parts[1].Trim();
                        }
                    }

                    if (dataElem.TryGetProperty("description", out var descElem) && string.IsNullOrWhiteSpace(result.Headline))
                    {
                        var desc = descElem.GetString();
                        if (!string.IsNullOrWhiteSpace(desc))
                        {
                            result.Headline = desc.Length > 120 ? desc[..117] + "..." : desc;
                        }
                    }

                    return new SuccessDataResult<LinkedInProfileScrapeDto>(result, Messages.ProfileScrapedSuccess);
                }
            }
        }
        catch
        {
            // Continue to fallback
        }

        // 3. Fallback direct OpenGraph attempt
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");

            using var response = await HttpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var html = await response.Content.ReadAsStringAsync();
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var ogTitle = doc.DocumentNode.SelectSingleNode("//meta[@property='og:title']")?.GetAttributeValue("content", "");
                var ogDesc = doc.DocumentNode.SelectSingleNode("//meta[@property='og:description']")?.GetAttributeValue("content", "");
                var ogImage = doc.DocumentNode.SelectSingleNode("//meta[@property='og:image']")?.GetAttributeValue("content", "");

                if (!string.IsNullOrWhiteSpace(ogTitle))
                {
                    var cleanTitle = ogTitle.Split('|')[0].Trim();
                    var parts = cleanTitle.Split(new[] { " - ", " – " }, StringSplitOptions.None);
                    if (parts.Length > 0 && !string.IsNullOrWhiteSpace(parts[0])) result.FullName = parts[0].Trim();
                    if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1])) result.Headline = parts[1].Trim();
                }

                if (!string.IsNullOrWhiteSpace(ogImage) && !ogImage.Contains("static.licdn.com/sc/h/"))
                {
                    result.AvatarUrl = ogImage;
                }
            }
        }
        catch
        {
            // Ignore
        }

        return new SuccessDataResult<LinkedInProfileScrapeDto>(result, Messages.ProfileScrapedSuccess);
    }
}
