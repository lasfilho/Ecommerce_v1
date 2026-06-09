using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Identity;

/// <summary>Adaptador do DbContext central para a porta IIdentityDbContext do módulo Identity.</summary>
internal sealed class IdentityDbContextAdapter(EcommerceDbContext dbContext) : IIdentityDbContext
{
    public DbSet<User> Users => dbContext.Users;
    public DbSet<Role> Roles => dbContext.Roles;
    public DbSet<UserRole> UserRoles => dbContext.UserRoles;
    public DbSet<RefreshToken> RefreshTokens => dbContext.RefreshTokens;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
