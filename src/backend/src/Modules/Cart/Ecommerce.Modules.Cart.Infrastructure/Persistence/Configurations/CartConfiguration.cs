using CartEntity = Ecommerce.Modules.Cart.Domain.Entities.Cart;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Cart.Infrastructure.Persistence.Configurations;

internal sealed class CartConfiguration : IEntityTypeConfiguration<CartEntity>
{
    public void Configure(EntityTypeBuilder<CartEntity> builder)
    {
        builder.ToTable("carts", "cart");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.UserId).HasColumnName("user_id");
        builder.Property(c => c.SessionId).HasColumnName("session_id").HasMaxLength(128);
        builder.Property(c => c.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(c => c.UserId)
            .HasDatabaseName("ix_carts_user_id")
            .HasFilter("user_id IS NOT NULL");

        builder.HasIndex(c => c.SessionId)
            .HasDatabaseName("ix_carts_session_id")
            .HasFilter("session_id IS NOT NULL");

        builder.HasIndex(c => new { c.UserId, c.Status })
            .HasDatabaseName("ix_carts_user_status");

        builder.HasMany(c => c.Items)
            .WithOne(i => i.Cart)
            .HasForeignKey(i => i.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(c => c.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
