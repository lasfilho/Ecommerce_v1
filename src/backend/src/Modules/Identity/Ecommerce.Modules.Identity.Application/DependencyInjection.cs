using Ecommerce.Modules.Identity.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Identity.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthTokenIssuer>();
        return services;
    }
}
