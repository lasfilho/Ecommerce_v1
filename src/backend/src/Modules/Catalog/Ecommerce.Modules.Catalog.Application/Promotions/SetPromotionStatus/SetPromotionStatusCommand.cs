using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.SetPromotionStatus;

public sealed record SetPromotionStatusCommand(Guid Id, bool IsActive) : ICommand<PromotionResponse>;

public sealed class SetPromotionStatusCommandValidator : AbstractValidator<SetPromotionStatusCommand>
{
    public SetPromotionStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public sealed class SetPromotionStatusCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<SetPromotionStatusCommand, Result<PromotionResponse>>
{
    public async Task<Result<PromotionResponse>> Handle(
        SetPromotionStatusCommand request,
        CancellationToken cancellationToken)
    {
        var promotion = await dbContext.Promotions
            .Include(p => p.Products)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (promotion is null)
        {
            return Result.Failure<PromotionResponse>(
                Error.NotFound("Catalog.PromotionNotFound", "Promoção não encontrada."));
        }

        promotion.SetActive(request.IsActive, DateTime.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(CatalogMapper.ToPromotionResponse(promotion));
    }
}
