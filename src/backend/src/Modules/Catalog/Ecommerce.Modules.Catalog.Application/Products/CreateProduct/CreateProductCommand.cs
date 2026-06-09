using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Common;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Products.CreateProduct;

public sealed record CreateProductCommand(
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

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
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

public sealed class CreateProductCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<CreateProductCommand, Result<ProductDetailResponse>>
{
    public async Task<Result<ProductDetailResponse>> Handle(
        CreateProductCommand request,
        CancellationToken cancellationToken)
    {
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

        if (await dbContext.Products.AnyAsync(p => p.Slug == slug, cancellationToken))
        {
            return Result.Failure<ProductDetailResponse>(
                Error.Conflict("Catalog.ProductSlugExists", "Já existe um produto com este slug."));
        }

        if (await dbContext.Products.AnyAsync(p => p.Sku == normalizedSku, cancellationToken))
        {
            return Result.Failure<ProductDetailResponse>(
                Error.Conflict("Catalog.ProductSkuExists", "Já existe um produto com este SKU."));
        }

        var productId = Guid.NewGuid();
        var product = new Product(
            productId,
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

        foreach (var image in CatalogMapper.ToEntities(productId, request.Images))
        {
            product.AddImage(image);
        }

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == productId, cancellationToken);

        return Result.Success(CatalogMapper.ToDetail(created));
    }
}
