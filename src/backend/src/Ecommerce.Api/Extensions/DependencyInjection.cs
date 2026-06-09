using Ecommerce.Api.Services;
using Ecommerce.Infrastructure;
using Ecommerce.Modules.Cart.Application;
using Ecommerce.Modules.Cart.Infrastructure;
using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Identity.Application;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Shared.Application;

namespace Ecommerce.Api.Extensions;

/// <summary>Registra todos os módulos e serviços compartilhados da aplicação.</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddInfrastructure(configuration);

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddAuthenticationServices(configuration);

        services.AddSharedApplication(
            typeof(CatalogApplicationAssemblyReference).Assembly,
            typeof(CartApplicationAssemblyReference).Assembly,
            typeof(OrdersApplicationAssemblyReference).Assembly,
            typeof(IdentityApplicationAssemblyReference).Assembly);

        services
            .AddCatalogInfrastructure()
            .AddCartInfrastructure()
            .AddOrdersInfrastructure()
            .AddIdentityInfrastructure(configuration);

        return services;
    }
}
