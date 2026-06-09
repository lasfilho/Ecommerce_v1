using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Categories.ListCategories;

public sealed record ListCategoriesQuery(bool? IsActive) : IQuery<IReadOnlyList<CategoryResponse>>;

public sealed class ListCategoriesQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<ListCategoriesQuery, IReadOnlyList<CategoryResponse>>
{
    public async Task<IReadOnlyList<CategoryResponse>> Handle(
        ListCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Categories.AsNoTracking();

        if (request.IsActive.HasValue)
        {
            query = query.Where(c => c.IsActive == request.IsActive.Value);
        }

        var categories = await query
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(CatalogMapper.ToResponse).ToList();
    }
}
