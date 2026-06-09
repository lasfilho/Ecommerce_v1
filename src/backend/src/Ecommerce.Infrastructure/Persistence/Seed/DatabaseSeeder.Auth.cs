using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence.Seed;

public static partial class DatabaseSeeder
{
    public static async Task SeedAsync(
        EcommerceDbContext context,
        IPasswordHasher passwordHasher,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await SeedRolesAsync(context, cancellationToken);
        await SeedAdminUserAsync(context, passwordHasher, cancellationToken);
        await SeedCatalogAsync(context, cancellationToken);

        logger.LogInformation("Seed do banco de dados concluído.");
    }

    private static async Task SeedAdminUserAsync(
        EcommerceDbContext context,
        IPasswordHasher passwordHasher,
        CancellationToken cancellationToken)
    {
        if (await context.Users.AnyAsync(u => u.Email == "admin@ecommerce.local", cancellationToken))
        {
            return;
        }

        var admin = new User(
            AdminUserId,
            "admin@ecommerce.local",
            passwordHasher.Hash("Admin@123"),
            "Admin",
            "Sistema",
            DateTime.UtcNow);

        context.Users.Add(admin);
        context.UserRoles.Add(new UserRole(AdminUserId, AdminRoleId));

        await context.SaveChangesAsync(cancellationToken);
    }
}
