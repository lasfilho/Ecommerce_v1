using Ecommerce.Modules.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Catalog.Infrastructure.Persistence.Configurations;

internal sealed class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("product_images", "catalog");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductId).HasColumnName("product_id");
        builder.Property(i => i.Url).HasColumnName("url").HasMaxLength(2048).IsRequired();
        builder.Property(i => i.AltText).HasColumnName("alt_text").HasMaxLength(300);
        builder.Property(i => i.DisplayOrder).HasColumnName("display_order");
        builder.Property(i => i.IsPrimary).HasColumnName("is_primary");

        builder.HasIndex(i => new { i.ProductId, i.DisplayOrder })
            .HasDatabaseName("ix_product_images_product_display_order");

        builder.HasIndex(i => i.ProductId)
            .HasFilter("is_primary = true")
            .IsUnique()
            .HasDatabaseName("ix_product_images_one_primary_per_product");
    }
}
