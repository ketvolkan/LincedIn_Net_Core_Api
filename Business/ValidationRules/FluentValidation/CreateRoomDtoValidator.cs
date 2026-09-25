using Entities.DTOs;
using FluentValidation;

namespace Business.ValidationRules.FluentValidation;

public class CreateRoomDtoValidator : AbstractValidator<CreateRoomDto>
{
    public CreateRoomDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Oda başlığı boş bırakılamaz!").MaximumLength(150);
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Linçlenecek kişinin adı boş bırakılamaz!").MaximumLength(120);
        RuleFor(x => x.MaxHp).GreaterThanOrEqualTo(100).WithMessage("Boss canı en az 100 olmalıdır!");
    }
}
