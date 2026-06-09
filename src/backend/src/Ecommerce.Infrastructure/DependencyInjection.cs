using Ecommerce.Infrastructure.Abstractions;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Persistence.Catalog;
using Ecommerce.Infrastructure.Persistence.Cart;
using Ecommerce.Infrastructure.Persistence.Identity;
using Ecommerce.Infrastructure.Persistence.Orders;
using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Shared.Application;
using Ecommerce.Infrastructure.Persistence.Interceptors;
using Ecommerce.Infrastructure.Persistence.Seed;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Cart.Infrastructure;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Orders.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure;

/// <summary>Infraestrutura cross-cutting: DbContext, interceptors e serviços compartilhados.</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSingleton<IDateTimeProvider, Services.DateTimeProvider>();
        services.AddScoped<AuditableEntityInterceptor>();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não configurada.");

        services.AddDbContext<EcommerceDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsHistoryTable("__ef_migrations_history", "public");
                npgsql.EnableRetryOnFailure(maxRetryCount: 3);
            });
            options.UseSnakeCaseNamingConvention();
        });

        services.AddScoped<IIdentityDbContext, IdentityDbContextAdapter>();
        services.AddScoped<ICatalogDbContext, CatalogDbContextAdapter>();
        services.AddScoped<ICartDbContext, CartDbContextAdapter>();
        services.AddScoped<IOrdersDbContext, OrdersDbContextAdapter>();
        services.AddScoped<IUnitOfWork, EcommerceUnitOfWork>();

        return services;
    }

    public static async Task InitializeDatabaseAsync(this IHost host)
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<EcommerceDbContext>>();

        try
        {
            var context = services.GetRequiredService<EcommerceDbContext>();
            var passwordHasher = services.GetRequiredService<IPasswordHasher>();
            await context.Database.MigrateAsync();
            await DatabaseSeeder.SeedAsync(context, passwordHasher, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao aplicar migrations ou seed do banco de dados.");
            throw;
        }
    }
}
