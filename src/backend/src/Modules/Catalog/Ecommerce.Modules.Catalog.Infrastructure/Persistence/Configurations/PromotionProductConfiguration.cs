using Ecommerce.Modules.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Catalog.Infrastructure.Persistence.Configurations;

internal sealed class PromotionProductConfiguration : IEntityTypeConfiguration<PromotionProduct>
{
    public void Configure(EntityTypeBuilder<PromotionProduct> builder)
    {
        builder.ToTable("promotion_products", "catalog");

        builder.HasKey(pp => new { pp.PromotionId, pp.ProductId });

        builder.Property(pp => pp.PromotionId).HasColumnName("promotion_id");
        builder.Property(pp => pp.ProductId).HasColumnName("product_id");
    }
}
