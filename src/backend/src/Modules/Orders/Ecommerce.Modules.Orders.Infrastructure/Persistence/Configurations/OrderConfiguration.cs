using Ecommerce.Modules.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Orders.Infrastructure.Persistence.Configurations;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", "orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.UserId).HasColumnName("user_id");
        builder.Property(o => o.CartId).HasColumnName("cart_id");
        builder.Property(o => o.OrderNumber).HasColumnName("order_number").HasMaxLength(30).IsRequired();
        builder.Property(o => o.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20);
        builder.Property(o => o.Subtotal).HasColumnName("subtotal").HasPrecision(18, 2);
        builder.Property(o => o.ShippingCost).HasColumnName("shipping_cost").HasPrecision(18, 2);
        builder.Property(o => o.Total).HasColumnName("total").HasPrecision(18, 2);
        builder.Property(o => o.PaidAt).HasColumnName("paid_at");
        builder.Property(o => o.ProcessingAt).HasColumnName("processing_at");
        builder.Property(o => o.ShippedAt).HasColumnName("shipped_at");
        builder.Property(o => o.DeliveredAt).HasColumnName("delivered_at");
        builder.Property(o => o.CancelledAt).HasColumnName("cancelled_at");
        builder.Property(o => o.CreatedAt).HasColumnName("created_at");
        builder.Property(o => o.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(o => o.CartId)
            .HasDatabaseName("ix_orders_cart_id");

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique()
            .HasDatabaseName("ix_orders_order_number");

        builder.HasIndex(o => new { o.UserId, o.CreatedAt })
            .HasDatabaseName("ix_orders_user_created_at");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("ix_orders_status");

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(o => o.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
