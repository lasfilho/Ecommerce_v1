using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Catalog.Domain.Enums;

namespace Ecommerce.Modules.Catalog.Application.Mapping;

internal static class CatalogMapper
{
    public static CategoryResponse ToResponse(Category category) =>
        new(
            category.Id,
            category.Name,
            category.Slug,
            category.Description,
            category.ParentCategoryId,
            category.IsActive,
            category.CreatedAt,
            category.UpdatedAt);

    public static CategorySummaryDto ToSummary(Category category) =>
        new(category.Id, category.Name, category.Slug);

    public static ProductDetailResponse ToDetail(Product product) =>
        new(
            product.Id,
            product.Name,
            product.Slug,
            product.Sku,
            product.ShortDescription,
            product.LongDescription,
            product.Price,
            product.PromotionalPrice,
            product.StockQuantity,
            product.IsActive,
            ToSummary(product.Category),
            product.Images
                .OrderBy(i => i.DisplayOrder)
                .Select(ToImageDto)
                .ToList(),
            product.CreatedAt,
            product.UpdatedAt);

    public static ProductListItemResponse ToListItem(Product product)
    {
        var primaryImage = product.Images
            .OrderByDescending(i => i.IsPrimary)
            .ThenBy(i => i.DisplayOrder)
            .Select(ToImageDto)
            .FirstOrDefault();

        return new(
            product.Id,
            product.Name,
            product.Slug,
            product.Sku,
            product.ShortDescription,
            product.Price,
            product.PromotionalPrice,
            product.StockQuantity,
            product.IsActive,
            ToSummary(product.Category),
            primaryImage,
            product.CreatedAt,
            product.UpdatedAt);
    }

    public static ProductImageDto ToImageDto(ProductImage image) =>
        new(image.Id, image.Url, image.AltText, image.DisplayOrder, image.IsPrimary);

    public static IReadOnlyList<ProductImage> ToEntities(
        Guid productId,
        IReadOnlyList<ProductImageInput> images)
    {
        if (images.Count == 0)
        {
            return [];
        }

        var hasPrimary = images.Any(i => i.IsPrimary);
        return images
            .Select((image, index) => new ProductImage(
                Guid.NewGuid(),
                productId,
                image.Url.Trim(),
                string.IsNullOrWhiteSpace(image.AltText) ? null : image.AltText.Trim(),
                image.DisplayOrder,
                hasPrimary ? image.IsPrimary : index == 0))
            .ToList();
    }

    public static PromotionResponse ToPromotionResponse(Promotion promotion) =>
        new(
            promotion.Id,
            promotion.Slug,
            promotion.Tag,
            promotion.Title,
            promotion.Subtitle,
            promotion.Highlight,
            promotion.HighlightLabel,
            promotion.BackgroundClass,
            promotion.FilterType.ToString(),
            promotion.CategoryId,
            promotion.MinPrice,
            promotion.Keywords,
            promotion.Products.Select(p => p.ProductId).ToList(),
            promotion.DisplayOrder,
            promotion.IsActive,
            promotion.StartsAt,
            promotion.EndsAt,
            promotion.CreatedAt,
            promotion.UpdatedAt);

    public static PromotionBannerResponse ToBanner(Promotion promotion) =>
        new(
            promotion.Slug,
            promotion.Tag,
            promotion.Title,
            promotion.Subtitle,
            promotion.Highlight,
            promotion.HighlightLabel,
            promotion.BackgroundClass);
}
