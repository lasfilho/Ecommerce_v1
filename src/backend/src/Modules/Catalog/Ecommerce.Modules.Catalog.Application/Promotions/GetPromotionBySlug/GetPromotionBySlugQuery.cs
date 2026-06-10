using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Promotions.GetPromotionBySlug;

public sealed record GetPromotionBySlugQuery(string Slug) : IQuery<PromotionResponse?>;

public sealed class GetPromotionBySlugQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<GetPromotionBySlugQuery, PromotionResponse?>
{
    public async Task<PromotionResponse?> Handle(
        GetPromotionBySlugQuery request,
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

        return promotion is null ? null : CatalogMapper.ToPromotionResponse(promotion);
    }
}
