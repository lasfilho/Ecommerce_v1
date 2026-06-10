using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Catalog;

/// <summary>Adaptador do DbContext central para a porta ICatalogDbContext do módulo Catalog.</summary>
internal sealed class CatalogDbContextAdapter(EcommerceDbContext dbContext) : ICatalogDbContext
{
    public DbSet<Category> Categories => dbContext.Categories;
    public DbSet<Product> Products => dbContext.Products;
    public DbSet<ProductImage> ProductImages => dbContext.ProductImages;
    public DbSet<Promotion> Promotions => dbContext.Promotions;
    public DbSet<PromotionProduct> PromotionProducts => dbContext.PromotionProducts;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
