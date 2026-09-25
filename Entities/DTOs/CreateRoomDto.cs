using System.ComponentModel.DataAnnotations;
using Core.Entities;

namespace Entities.DTOs;

public class CreateRoomDto : IDto
{
    [Required(ErrorMessage = "Oda başlığı zorunludur.")]
    [StringLength(80, MinimumLength = 3, ErrorMessage = "Oda başlığı 3 ile 80 karakter arasında olmalıdır.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Linç sebebi zorunludur.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Linç sebebi 2 ile 200 karakter arasında olmalıdır.")]
    public string Description { get; set; } = string.Empty;

    [StringLength(300, ErrorMessage = "LinkedIn bağlantısı en fazla 300 karakter olabilir.")]
    public string LinkedInUrl { get; set; } = string.Empty;

    [Required(ErrorMessage = "Boss adı ve soyadı zorunludur.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Boss adı 2 ile 50 karakter arasında olmalıdır.")]
    public string FullName { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Unvan en fazla 100 karakter olabilir.")]
    public string Headline { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Görsel bağlantısı en fazla 500 karakter olabilir.")]
    public string AvatarUrl { get; set; } = string.Empty;

    [Range(1000, 1000000, ErrorMessage = "Boss canı 1.000 ile 1.000.000 arasında olmalıdır.")]
    public int MaxHp { get; set; } = 50000;
}
