using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Common;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Application.Products.ListProducts;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.ListPromotionProducts;

public sealed record ListPromotionProductsQuery(
    string Slug,
    int Page,
    int PageSize,
    ProductSortBy SortBy,
    SortDirection SortDirection) : IQuery<PagedResult<ProductListItemResponse>>;

public sealed class ListPromotionProductsQueryValidator : AbstractValidator<ListPromotionProductsQuery>
{
    public ListPromotionProductsQueryValidator()
    {
        RuleFor(x => x.Slug).NotEmpty();
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}

public sealed class ListPromotionProductsQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<ListPromotionProductsQuery, PagedResult<ProductListItemResponse>>
{
    public async Task<PagedResult<ProductListItemResponse>> Handle(
        ListPromotionProductsQuery request,
        CancellationToken cancellationToken)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();
        var now = DateTime.UtcNow;

        var promotion = await dbContext.Promotions
            .AsNoTracking()
            .Include(p => p.Products)
            .FirstOrDefaultAsync(
                p => p.Slug == slug
                    && p.IsActive
                    && (p.StartsAt == null || p.StartsAt <= now)
                    && (p.EndsAt == null || p.EndsAt >= now),
                cancellationToken);

        if (promotion is null)
        {
            return new PagedResult<ProductListItemResponse>([], request.Page, request.PageSize, 0, 0);
        }

        var query = dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        query = PromotionProductFilter.Apply(query, promotion);
        query = ApplySorting(query, request.SortBy, request.SortDirection);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductListItemResponse>(
            items.Select(CatalogMapper.ToListItem).ToList(),
            request.Page,
            request.PageSize,
            totalCount,
            totalPages);
    }

    private static IQueryable<Domain.Entities.Product> ApplySorting(
        IQueryable<Domain.Entities.Product> query,
        ProductSortBy sortBy,
        SortDirection sortDirection) =>
        (sortBy, sortDirection) switch
        {
            (ProductSortBy.Name, SortDirection.Asc) => query.OrderBy(p => p.Name),
            (ProductSortBy.Name, SortDirection.Desc) => query.OrderByDescending(p => p.Name),
            (ProductSortBy.Price, SortDirection.Asc) => query.OrderBy(p => p.Price),
            (ProductSortBy.Price, SortDirection.Desc) => query.OrderByDescending(p => p.Price),
            (ProductSortBy.CreatedAt, SortDirection.Asc) => query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };
}
