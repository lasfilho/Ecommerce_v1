using Ecommerce.Modules.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Catalog.Infrastructure.Persistence.Configurations;

internal sealed class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
{
    public void Configure(EntityTypeBuilder<Promotion> builder)
    {
        builder.ToTable("promotions", "catalog");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Slug).HasColumnName("slug").HasMaxLength(120).IsRequired();
        builder.Property(p => p.Tag).HasColumnName("tag").HasMaxLength(80).IsRequired();
        builder.Property(p => p.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(p => p.Subtitle).HasColumnName("subtitle").HasMaxLength(500).IsRequired();
        builder.Property(p => p.Highlight).HasColumnName("highlight").HasMaxLength(40);
        builder.Property(p => p.HighlightLabel).HasColumnName("highlight_label").HasMaxLength(80);
        builder.Property(p => p.BackgroundClass).HasColumnName("background_class").HasMaxLength(300).IsRequired();
        builder.Property(p => p.FilterType).HasColumnName("filter_type").IsRequired();
        builder.Property(p => p.CategoryId).HasColumnName("category_id");
        builder.Property(p => p.MinPrice).HasColumnName("min_price").HasPrecision(18, 2);
        builder.Property(p => p.Keywords).HasColumnName("keywords").HasMaxLength(500);
        builder.Property(p => p.DisplayOrder).HasColumnName("display_order").IsRequired();
        builder.Property(p => p.IsActive).HasColumnName("is_active").IsRequired();
        builder.Property(p => p.StartsAt).HasColumnName("starts_at");
        builder.Property(p => p.EndsAt).HasColumnName("ends_at");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(p => p.Slug).IsUnique().HasDatabaseName("ix_promotions_slug");
        builder.HasIndex(p => p.DisplayOrder).HasDatabaseName("ix_promotions_display_order");

        builder
            .HasMany(p => p.Products)
            .WithOne()
            .HasForeignKey(pp => pp.PromotionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Products)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
