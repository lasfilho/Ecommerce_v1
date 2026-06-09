namespace Ecommerce.Modules.Catalog.Application.Models;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);

public sealed record ProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    int DisplayOrder,
    bool IsPrimary);

public sealed record CategorySummaryDto(
    Guid Id,
    string Name,
    string Slug);

public sealed record CategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    Guid? ParentCategoryId,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record ProductListItemResponse(
    Guid Id,
    string Name,
    string Slug,
    string Sku,
    string? ShortDescription,
    decimal Price,
    decimal? PromotionalPrice,
    int StockQuantity,
    bool IsActive,
    CategorySummaryDto Category,
    ProductImageDto? PrimaryImage,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record ProductDetailResponse(
    Guid Id,
    string Name,
    string Slug,
    string Sku,
    string? ShortDescription,
    string? LongDescription,
    decimal Price,
    decimal? PromotionalPrice,
    int StockQuantity,
    bool IsActive,
    CategorySummaryDto Category,
    IReadOnlyList<ProductImageDto> Images,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record ProductImageInput(
    string Url,
    string? AltText,
    int DisplayOrder,
    bool IsPrimary);
