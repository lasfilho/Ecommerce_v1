using Ecommerce.Infrastructure.Abstractions;
using Ecommerce.Infrastructure.Persistence.Interceptors;
using Ecommerce.Modules.Cart.Domain.Entities;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Identity.Domain.Entities;
using Ecommerce.Modules.Orders.Domain.Entities;
using Ecommerce.Modules.Cart.Infrastructure;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Orders.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence;

/// <summary>Contexto único do modular monolith — schemas PostgreSQL separam os módulos logicamente.</summary>
public sealed class EcommerceDbContext : DbContext
{
    private readonly AuditableEntityInterceptor _auditableEntityInterceptor;

    public EcommerceDbContext(
        DbContextOptions<EcommerceDbContext> options,
        AuditableEntityInterceptor auditableEntityInterceptor)
        : base(options)
    {
        _auditableEntityInterceptor = auditableEntityInterceptor;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("public");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogInfrastructureAssemblyReference).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CartInfrastructureAssemblyReference).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrdersInfrastructureAssemblyReference).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityInfrastructureAssemblyReference).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
