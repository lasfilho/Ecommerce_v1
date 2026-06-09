using Ecommerce.Modules.Cart.Application;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Cart.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCartInfrastructure(this IServiceCollection services)
    {
        services.AddCartApplication();
        return services;
    }
}
