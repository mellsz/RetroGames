using FluentValidation;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Validators.Genero;

public sealed class SalvarGeneroRequestValidator : AbstractValidator<SalvarGeneroRequestApiModel>
{
    public SalvarGeneroRequestValidator()
    {
        RuleFor(request => request.Nome).NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(50).WithMessage("O nome deve ter no máximo 50 caracteres.");
    }
}
