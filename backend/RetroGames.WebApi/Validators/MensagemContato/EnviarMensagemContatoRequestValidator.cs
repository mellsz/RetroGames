using FluentValidation;
using RetroGames.WebApi.ApiModels;

namespace RetroGames.WebApi.Validators.MensagemContato;

public sealed class EnviarMensagemContatoRequestValidator : AbstractValidator<EnviarMensagemContatoRequestApiModel>
{
    public EnviarMensagemContatoRequestValidator()
    {
        RuleFor(request => request.Mensagem)
            .NotEmpty().WithMessage("A mensagem é obrigatória.")
            .MaximumLength(2000).WithMessage("A mensagem deve ter no máximo 2000 caracteres.");
    }
}
