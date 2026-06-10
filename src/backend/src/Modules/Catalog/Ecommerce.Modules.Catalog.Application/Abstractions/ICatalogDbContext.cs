using Ecommerce.Modules.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Abstractions;

/// <summary>Porta de persistência do módulo Catalog — implementada na infraestrutura central.</summary>
public interface ICatalogDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<Promotion> Promotions { get; }
    DbSet<PromotionProduct> PromotionProducts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
