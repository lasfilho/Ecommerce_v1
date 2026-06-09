using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Products.ListProducts;

public enum ProductSortBy
{
    Name,
    Price,
    CreatedAt
}

public enum SortDirection
{
    Asc,
    Desc
}

public sealed record ListProductsQuery(
    int Page,
    int PageSize,
    Guid? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    bool? IsActive,
    ProductSortBy SortBy,
    SortDirection SortDirection) : IQuery<PagedResult<ProductListItemResponse>>;

public sealed class ListProductsQueryValidator : AbstractValidator<ListProductsQuery>
{
    public ListProductsQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.MinPrice).GreaterThanOrEqualTo(0).When(x => x.MinPrice.HasValue);
        RuleFor(x => x.MaxPrice).GreaterThanOrEqualTo(0).When(x => x.MaxPrice.HasValue);
        RuleFor(x => x.MaxPrice)
            .GreaterThanOrEqualTo(x => x.MinPrice!.Value)
            .When(x => x.MinPrice.HasValue && x.MaxPrice.HasValue);
    }
}

public sealed class ListProductsQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<ListProductsQuery, PagedResult<ProductListItemResponse>>
{
    public async Task<PagedResult<ProductListItemResponse>> Handle(
        ListProductsQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(p => p.IsActive == request.IsActive.Value);
        }
        else
        {
            query = query.Where(p => p.IsActive);
        }

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
        SortDirection sortDirection)
    {
        return (sortBy, sortDirection) switch
        {
            (ProductSortBy.Name, SortDirection.Asc) => query.OrderBy(p => p.Name),
            (ProductSortBy.Name, SortDirection.Desc) => query.OrderByDescending(p => p.Name),
            (ProductSortBy.Price, SortDirection.Asc) => query.OrderBy(p => p.Price),
            (ProductSortBy.Price, SortDirection.Desc) => query.OrderByDescending(p => p.Price),
            (ProductSortBy.CreatedAt, SortDirection.Asc) => query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };
    }
}
