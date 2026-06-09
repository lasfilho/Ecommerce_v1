using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Orders.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddOrdersApplication(this IServiceCollection services) => services;
}
