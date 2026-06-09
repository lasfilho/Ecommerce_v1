using Ecommerce.Modules.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Abstractions;

/// <summary>Porta de persistência do módulo Identity — implementada na infraestrutura central.</summary>
public interface IIdentityDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
