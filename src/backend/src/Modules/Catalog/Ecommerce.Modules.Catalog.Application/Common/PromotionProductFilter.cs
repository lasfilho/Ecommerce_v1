using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Catalog.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Common;

/// <summary>Aplica as regras dinâmicas da promoção — a listagem se atualiza automaticamente.</summary>
internal static class PromotionProductFilter
{
    public static IQueryable<Product> Apply(
        IQueryable<Product> query,
        Promotion promotion)
    {
        query = query.Where(p => p.IsActive);

        return promotion.FilterType switch
        {
            PromotionFilterType.HasDiscount => query.Where(p =>
                p.PromotionalPrice != null && p.PromotionalPrice < p.Price),
            PromotionFilterType.Category when promotion.CategoryId.HasValue => query.Where(p =>
                p.CategoryId == promotion.CategoryId.Value),
            PromotionFilterType.MinPrice when promotion.MinPrice.HasValue => query.Where(p =>
                (p.PromotionalPrice ?? p.Price) >= promotion.MinPrice.Value),
            PromotionFilterType.Keywords => ApplyKeywords(query, promotion.Keywords),
            PromotionFilterType.ProductIds => query.Where(p =>
                promotion.Products.Select(pp => pp.ProductId).Contains(p.Id)),
            _ => query
        };
    }

    private static IQueryable<Product> ApplyKeywords(IQueryable<Product> query, string? keywords)
    {
        if (string.IsNullOrWhiteSpace(keywords))
        {
            return query;
        }

        var terms = keywords
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => t.ToLowerInvariant())
            .Where(t => t.Length > 0)
            .ToArray();

        if (terms.Length == 0)
        {
            return query;
        }

        return query.Where(p =>
            terms.Any(term =>
                p.Name.ToLower().Contains(term)
                || (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(term))
                || (p.LongDescription != null && p.LongDescription.ToLower().Contains(term))));
    }
}
