using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Common;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Products.UpdateProduct;

public sealed record UpdateProductCommand(
    Guid ProductId,
    Guid CategoryId,
    string Name,
    string? Slug,
    string Sku,
    string? ShortDescription,
    string? LongDescription,
    decimal Price,
    decimal? PromotionalPrice,
    int StockQuantity,
    IReadOnlyList<ProductImageInput> Images) : ICommand<ProductDetailResponse>;

public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Slug).MaximumLength(300);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ShortDescription).MaximumLength(500);
        RuleFor(x => x.LongDescription).MaximumLength(8000);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PromotionalPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.PromotionalPrice.HasValue);
        RuleFor(x => x.PromotionalPrice)
            .LessThanOrEqualTo(x => x.Price)
            .When(x => x.PromotionalPrice.HasValue);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
        RuleForEach(x => x.Images).ChildRules(image =>
        {
            image.RuleFor(i => i.Url).NotEmpty().MaximumLength(2000);
            image.RuleFor(i => i.AltText).MaximumLength(300);
            image.RuleFor(i => i.DisplayOrder).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed class UpdateProductCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<UpdateProductCommand, Result<ProductDetailResponse>>
{
    public async Task<Result<ProductDetailResponse>> Handle(
        UpdateProductCommand request,
        CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product is null)
        {
            return Result.Failure<ProductDetailResponse>(
                Error.NotFound("Catalog.ProductNotFound", "Produto não encontrado."));
        }

        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == request.CategoryId && c.IsActive, cancellationToken);

        if (!categoryExists)
        {
            return Result.Failure<ProductDetailResponse>(
                Error.NotFound("Catalog.CategoryNotFound", "Categoria não encontrada ou inativa."));
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? SlugNormalizer.Normalize(request.Name)
            : SlugNormalizer.Normalize(request.Slug);

        if (string.IsNullOrWhiteSpace(slug))
        {
            return Result.Failure<ProductDetailResponse>(
                Error.Validation("Catalog.InvalidSlug", "Não foi possível gerar um slug válido."));
        }

        var normalizedSku = request.Sku.Trim().ToUpperInvariant();

        if (await dbContext.Products.AnyAsync(
                p => p.Slug == slug && p.Id != request.ProductId,
                cancellationToken))
        {
            return Result.Failure<ProductDetailResponse>(
                Error.Conflict("Catalog.ProductSlugExists", "Já existe um produto com este slug."));
        }

        if (await dbContext.Products.AnyAsync(
                p => p.Sku == normalizedSku && p.Id != request.ProductId,
                cancellationToken))
        {
            return Result.Failure<ProductDetailResponse>(
                Error.Conflict("Catalog.ProductSkuExists", "Já existe um produto com este SKU."));
        }

        product.Update(
            request.CategoryId,
            request.Name.Trim(),
            slug,
            normalizedSku,
            string.IsNullOrWhiteSpace(request.ShortDescription) ? null : request.ShortDescription.Trim(),
            string.IsNullOrWhiteSpace(request.LongDescription) ? null : request.LongDescription.Trim(),
            request.Price,
            request.PromotionalPrice,
            request.StockQuantity,
            DateTime.UtcNow);

        product.ReplaceImages(CatalogMapper.ToEntities(product.Id, request.Images));

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == request.ProductId, cancellationToken);

        return Result.Success(CatalogMapper.ToDetail(updated));
    }
}
