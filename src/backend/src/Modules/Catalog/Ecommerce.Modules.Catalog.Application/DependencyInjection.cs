using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Catalog.Application;

/// <summary>Registra serviços específicos do módulo Catalog (além de MediatR centralizado).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddCatalogApplication(this IServiceCollection services)
    {
        // Repositórios e serviços de aplicação do Catalog serão registrados aqui.
        return services;
    }
}
