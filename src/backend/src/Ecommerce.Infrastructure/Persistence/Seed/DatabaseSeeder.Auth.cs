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
        await SeedPromotionsAsync(context, cancellationToken);

        logger.LogInformation("Seed do banco de dados concluído.");
    }

    private const string AdminEmail = "admin@ecommerce.local";
    private const string AdminPassword = "Admin@123";

    private static async Task SeedAdminUserAsync(
        EcommerceDbContext context,
        IPasswordHasher passwordHasher,
        CancellationToken cancellationToken)
    {
        var admin = await context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == AdminEmail, cancellationToken);

        if (admin is null)
        {
            admin = new User(
                AdminUserId,
                AdminEmail,
                passwordHasher.Hash(AdminPassword),
                "Admin",
                "Sistema",
                DateTime.UtcNow);

            context.Users.Add(admin);
            context.UserRoles.Add(new UserRole(AdminUserId, AdminRoleId));
        }
        else if (!passwordHasher.Verify(AdminPassword, admin.PasswordHash))
        {
            admin.SetPasswordHash(passwordHasher.Hash(AdminPassword), DateTime.UtcNow);

            if (!admin.UserRoles.Any(ur => ur.RoleId == AdminRoleId))
            {
                context.UserRoles.Add(new UserRole(admin.Id, AdminRoleId));
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
