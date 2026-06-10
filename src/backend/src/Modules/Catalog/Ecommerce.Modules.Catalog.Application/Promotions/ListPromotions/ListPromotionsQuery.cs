using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.ListPromotions;

public sealed record ListPromotionsQuery(bool? IsActive) : IQuery<IReadOnlyList<PromotionResponse>>;

public sealed class ListPromotionsQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<ListPromotionsQuery, IReadOnlyList<PromotionResponse>>
{
    public async Task<IReadOnlyList<PromotionResponse>> Handle(
        ListPromotionsQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Promotions.AsNoTracking().Include(p => p.Products).AsQueryable();

        if (request.IsActive.HasValue)
        {
            query = query.Where(p => p.IsActive == request.IsActive.Value);
        }

        var items = await query
            .OrderBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return items.Select(CatalogMapper.ToPromotionResponse).ToList();
    }
}
