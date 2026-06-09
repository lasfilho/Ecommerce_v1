namespace Ecommerce.Api.Contracts.Catalog;

public sealed record CreateCategoryRequest(
    string Name,
    string? Slug,
    string? Description,
    Guid? ParentCategoryId);

public sealed record UpdateCategoryRequest(
    string Name,
    string? Slug,
    string? Description,
    Guid? ParentCategoryId);

public sealed record SetCategoryStatusRequest(bool IsActive);

public sealed record CreateProductRequest(
    Guid CategoryId,
    string Name,
    string? Slug,
    string Sku,
    string? ShortDescription,
    string? LongDescription,
    decimal Price,
    decimal? PromotionalPrice,
    int StockQuantity,
    IReadOnlyList<ProductImageRequest>? Images);

public sealed record UpdateProductRequest(
    Guid CategoryId,
    string Name,
    string? Slug,
    string Sku,
    string? ShortDescription,
    string? LongDescription,
    decimal Price,
    decimal? PromotionalPrice,
    int StockQuantity,
    IReadOnlyList<ProductImageRequest>? Images);

public sealed record SetProductStatusRequest(bool IsActive);

/// <summary>Referência de imagem por URL — upload de arquivo virá depois.</summary>
public sealed record ProductImageRequest(
    string Url,
    string? AltText,
    int DisplayOrder,
    bool IsPrimary);

public sealed record ListProductsQueryParams(
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    bool? IsActive = null,
    string SortBy = "createdAt",
    string SortDirection = "desc");
