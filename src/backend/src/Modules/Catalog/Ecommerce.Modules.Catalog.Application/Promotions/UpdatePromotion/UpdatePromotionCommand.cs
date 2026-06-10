using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Domain.Enums;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.UpdatePromotion;

public sealed record UpdatePromotionCommand(
    Guid Id,
    string Tag,
    string Title,
    string Subtitle,
    string? Highlight,
    string? HighlightLabel,
    string BackgroundClass,
    PromotionFilterType FilterType,
    Guid? CategoryId,
    decimal? MinPrice,
    string? Keywords,
    IReadOnlyList<Guid> ProductIds,
    int DisplayOrder,
    DateTime? StartsAt,
    DateTime? EndsAt) : ICommand<PromotionResponse>;

public sealed class UpdatePromotionCommandValidator : AbstractValidator<UpdatePromotionCommand>
{
    public UpdatePromotionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Tag).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Subtitle).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BackgroundClass).NotEmpty().MaximumLength(300);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdatePromotionCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<UpdatePromotionCommand, Result<PromotionResponse>>
{
    public async Task<Result<PromotionResponse>> Handle(
        UpdatePromotionCommand request,
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

        if (request.FilterType == PromotionFilterType.Category && request.CategoryId.HasValue)
        {
            var categoryExists = await dbContext.Categories
                .AnyAsync(c => c.Id == request.CategoryId.Value, cancellationToken);
            if (!categoryExists)
            {
                return Result.Failure<PromotionResponse>(
                    Error.NotFound("Catalog.CategoryNotFound", "Categoria não encontrada."));
            }
        }

        if (request.FilterType == PromotionFilterType.ProductIds && request.ProductIds.Count > 0)
        {
            var count = await dbContext.Products
                .CountAsync(p => request.ProductIds.Contains(p.Id), cancellationToken);
            if (count != request.ProductIds.Count)
            {
                return Result.Failure<PromotionResponse>(
                    Error.Validation("Catalog.InvalidProductIds", "Um ou mais produtos são inválidos."));
            }
        }

        promotion.Update(
            request.Tag.Trim(),
            request.Title.Trim(),
            request.Subtitle.Trim(),
            string.IsNullOrWhiteSpace(request.Highlight) ? null : request.Highlight.Trim(),
            string.IsNullOrWhiteSpace(request.HighlightLabel) ? null : request.HighlightLabel.Trim(),
            request.BackgroundClass.Trim(),
            request.FilterType,
            request.CategoryId,
            request.MinPrice,
            string.IsNullOrWhiteSpace(request.Keywords) ? null : request.Keywords.Trim(),
            request.DisplayOrder,
            request.StartsAt,
            request.EndsAt,
            DateTime.UtcNow);

        if (request.FilterType == PromotionFilterType.ProductIds)
        {
            promotion.ReplaceProducts(request.ProductIds);
        }
        else
        {
            promotion.ReplaceProducts([]);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(CatalogMapper.ToPromotionResponse(promotion));
    }
}
