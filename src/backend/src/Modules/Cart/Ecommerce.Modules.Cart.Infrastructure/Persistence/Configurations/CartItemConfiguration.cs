using Ecommerce.Modules.Cart.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Cart.Infrastructure.Persistence.Configurations;

internal sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("cart_items", "cart");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.CartId).HasColumnName("cart_id");
        builder.Property(i => i.ProductId).HasColumnName("product_id");
        builder.Property(i => i.Quantity).HasColumnName("quantity");
        builder.Property(i => i.UnitPrice).HasColumnName("unit_price").HasPrecision(18, 2);

        builder.HasIndex(i => new { i.CartId, i.ProductId })
            .IsUnique()
            .HasDatabaseName("ix_cart_items_cart_product");
    }
}
