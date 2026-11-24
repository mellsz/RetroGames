using FluentValidation;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Validators.Plataforma;

public sealed class AlterarPlataformaRequestValidator : AbstractValidator<AlterarPlataformaRequestApiModel>
{
    public AlterarPlataformaRequestValidator()
    {
        RuleFor(request => request.Nome)
            .NotEmpty()
            .WithMessage("O nome é obrigatório.")
            .MaximumLength(80)
            .WithMessage("O nome deve ter no máximo 80 caracteres.");

        RuleFor(request => request.Fabricante)
            .NotEmpty()
            .WithMessage("O fabricante é obrigatório.")
            .MaximumLength(80)
            .WithMessage("O fabricante deve ter no máximo 80 caracteres.");

        RuleFor(request => request.AnoLancamento)
            .InclusiveBetween(1970, 2100)
            .WithMessage("O ano de lançamento deve estar entre 1970 e 2100.");
    }
}
