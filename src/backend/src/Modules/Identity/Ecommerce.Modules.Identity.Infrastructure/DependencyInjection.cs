using Ecommerce.Modules.Identity.Application;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Options;
using Ecommerce.Modules.Identity.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddIdentityApplication();

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddSingleton<IPasswordHasher, PasswordHasherService>();
        services.AddSingleton<IRefreshTokenGenerator, RefreshTokenGeneratorService>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGeneratorService>();

        return services;
    }
}
