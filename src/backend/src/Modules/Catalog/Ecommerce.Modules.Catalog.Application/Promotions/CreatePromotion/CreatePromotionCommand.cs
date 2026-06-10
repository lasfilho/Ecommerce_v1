using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Common;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Catalog.Domain.Enums;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.CreatePromotion;

public sealed record CreatePromotionCommand(
    string Slug,
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

public sealed class CreatePromotionCommandValidator : AbstractValidator<CreatePromotionCommand>
{
    public CreatePromotionCommandValidator()
    {
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Tag).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Subtitle).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BackgroundClass).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Keywords).MaximumLength(500);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CategoryId).NotEmpty().When(x => x.FilterType == PromotionFilterType.Category);
        RuleFor(x => x.MinPrice).GreaterThan(0).When(x => x.FilterType == PromotionFilterType.MinPrice);
        RuleFor(x => x.ProductIds).NotEmpty().When(x => x.FilterType == PromotionFilterType.ProductIds);
        RuleFor(x => x.Keywords).NotEmpty().When(x => x.FilterType == PromotionFilterType.Keywords);
    }
}

public sealed class CreatePromotionCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<CreatePromotionCommand, Result<PromotionResponse>>
{
    public async Task<Result<PromotionResponse>> Handle(
        CreatePromotionCommand request,
        CancellationToken cancellationToken)
    {
        var slug = SlugNormalizer.Normalize(request.Slug);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return Result.Failure<PromotionResponse>(
                Error.Validation("Catalog.InvalidSlug", "Slug inválido para a promoção."));
        }

        if (await dbContext.Promotions.AnyAsync(p => p.Slug == slug, cancellationToken))
        {
            return Result.Failure<PromotionResponse>(
                Error.Conflict("Catalog.PromotionSlugExists", "Já existe uma promoção com este slug."));
        }

        var validation = await ValidateFilterAsync(request, cancellationToken);
        if (validation.IsFailure)
        {
            return Result.Failure<PromotionResponse>(validation.Error);
        }

        var promotion = new Promotion(
            Guid.NewGuid(),
            slug,
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

        dbContext.Promotions.Add(promotion);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await dbContext.Promotions
            .Include(p => p.Products)
            .FirstAsync(p => p.Id == promotion.Id, cancellationToken);

        return Result.Success(CatalogMapper.ToPromotionResponse(created));
    }

    private async Task<Result> ValidateFilterAsync(
        CreatePromotionCommand request,
        CancellationToken cancellationToken)
    {
        if (request.FilterType == PromotionFilterType.Category && request.CategoryId.HasValue)
        {
            var exists = await dbContext.Categories
                .AnyAsync(c => c.Id == request.CategoryId.Value, cancellationToken);
            if (!exists)
            {
                return Result.Failure(Error.NotFound("Catalog.CategoryNotFound", "Categoria não encontrada."));
            }
        }

        if (request.FilterType == PromotionFilterType.ProductIds && request.ProductIds.Count > 0)
        {
            var count = await dbContext.Products
                .CountAsync(p => request.ProductIds.Contains(p.Id), cancellationToken);
            if (count != request.ProductIds.Count)
            {
                return Result.Failure(Error.Validation("Catalog.InvalidProductIds", "Um ou mais produtos são inválidos."));
            }
        }

        return Result.Success();
    }
}
