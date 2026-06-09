using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence.Seed;

/// <summary>Dados iniciais para desenvolvimento — idempotente (não duplica registros).</summary>
public static partial class DatabaseSeeder
{
    public static readonly Guid AdminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid CustomerRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid AdminRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid ElectronicsCategoryId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid SampleProductId = Guid.Parse("55555555-5555-5555-5555-555555555555");
    public static readonly Guid SampleProductImageId = Guid.Parse("66666666-6666-6666-6666-666666666666");

    public static async Task SeedAsync(EcommerceDbContext context, ILogger logger, CancellationToken cancellationToken = default)
    {
        await SeedRolesAsync(context, cancellationToken);
        await SeedCatalogAsync(context, cancellationToken);

        logger.LogInformation("Seed do banco de dados concluído (sem usuário admin — use overload com IPasswordHasher).");
    }

    private static async Task SeedRolesAsync(EcommerceDbContext context, CancellationToken cancellationToken)
    {
        if (await context.Roles.AnyAsync(cancellationToken))
        {
            return;
        }

        context.Roles.AddRange(
            new Role(CustomerRoleId, "Customer", "CUSTOMER"),
            new Role(AdminRoleId, "Admin", "ADMIN"));

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedCatalogAsync(EcommerceDbContext context, CancellationToken cancellationToken)
    {
        if (await context.Categories.AnyAsync(cancellationToken))
        {
            return;
        }

        var category = new Category(
            ElectronicsCategoryId,
            "Eletrônicos",
            "eletronicos",
            "Produtos eletrônicos e acessórios",
            null,
            DateTime.UtcNow);

        var product = new Product(
            SampleProductId,
            ElectronicsCategoryId,
            "Fone de Ouvido Bluetooth",
            "fone-bluetooth",
            "SKU-001",
            "Fone sem fio com cancelamento de ruído.",
            299.90m,
            50,
            DateTime.UtcNow);

        var image = new ProductImage(
            SampleProductImageId,
            SampleProductId,
            "https://placehold.co/600x600/png",
            "Fone de Ouvido Bluetooth",
            0,
            true);

        context.Categories.Add(category);
        context.Products.Add(product);
        context.ProductImages.Add(image);

        await context.SaveChangesAsync(cancellationToken);
    }
}
