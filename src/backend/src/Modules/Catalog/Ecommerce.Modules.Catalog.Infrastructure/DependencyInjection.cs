using Ecommerce.Modules.Catalog.Application;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Catalog.Infrastructure;

/// <summary>Registra persistência e integrações do módulo Catalog.</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddCatalogInfrastructure(this IServiceCollection services)
    {
        services.AddCatalogApplication();

        // DbContext, repositórios e integrações do Catalog serão registrados aqui.

        return services;
    }
}
