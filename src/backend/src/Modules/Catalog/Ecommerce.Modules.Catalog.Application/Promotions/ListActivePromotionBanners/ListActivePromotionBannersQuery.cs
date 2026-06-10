using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.ListActivePromotionBanners;

public sealed record ListActivePromotionBannersQuery : IQuery<IReadOnlyList<PromotionBannerResponse>>;

public sealed class ListActivePromotionBannersQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<ListActivePromotionBannersQuery, IReadOnlyList<PromotionBannerResponse>>
{
    public async Task<IReadOnlyList<PromotionBannerResponse>> Handle(
        ListActivePromotionBannersQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var items = await dbContext.Promotions
            .AsNoTracking()
            .Where(p => p.IsActive)
            .Where(p => p.StartsAt == null || p.StartsAt <= now)
            .Where(p => p.EndsAt == null || p.EndsAt >= now)
            .OrderBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return items.Select(CatalogMapper.ToBanner).ToList();
    }
}
