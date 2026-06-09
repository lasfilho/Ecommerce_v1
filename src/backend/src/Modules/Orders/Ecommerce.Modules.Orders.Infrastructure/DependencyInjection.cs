using Ecommerce.Modules.Orders.Application;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Orders.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddOrdersInfrastructure(this IServiceCollection services)
    {
        services.AddOrdersApplication();
        return services;
    }
}
