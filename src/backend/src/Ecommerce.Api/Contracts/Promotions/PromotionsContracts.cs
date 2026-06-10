using Ecommerce.Modules.Catalog.Domain.Enums;

namespace Ecommerce.Api.Contracts.Promotions;

public sealed record CreatePromotionRequest(
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
    DateTime? EndsAt);

public sealed record UpdatePromotionRequest(
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
    DateTime? EndsAt);

public sealed record SetPromotionStatusRequest(bool IsActive);

public sealed record ListPromotionProductsQueryParams(
    int Page = 1,
    int PageSize = 48,
    string SortBy = "createdAt",
    string SortDirection = "desc");
