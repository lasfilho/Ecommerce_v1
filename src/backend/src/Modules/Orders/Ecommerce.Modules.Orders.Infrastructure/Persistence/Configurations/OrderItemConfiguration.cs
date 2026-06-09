using Ecommerce.Modules.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Orders.Infrastructure.Persistence.Configurations;

internal sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items", "orders");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.OrderId).HasColumnName("order_id");
        builder.Property(i => i.ProductId).HasColumnName("product_id");
        builder.Property(i => i.ProductName).HasColumnName("product_name").HasMaxLength(300).IsRequired();
        builder.Property(i => i.Sku).HasColumnName("sku").HasMaxLength(50).IsRequired();
        builder.Property(i => i.Quantity).HasColumnName("quantity");
        builder.Property(i => i.UnitPrice).HasColumnName("unit_price").HasPrecision(18, 2);
        builder.Property(i => i.LineTotal).HasColumnName("line_total").HasPrecision(18, 2);

        builder.HasIndex(i => i.OrderId)
            .HasDatabaseName("ix_order_items_order_id");

        builder.HasIndex(i => i.ProductId)
            .HasDatabaseName("ix_order_items_product_id");
    }
}
