using Ecommerce.Infrastructure;

namespace Ecommerce.Api.Extensions;

/// <summary>Extensões de inicialização da aplicação.</summary>
public static class DatabaseExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        await ((IHost)app).InitializeDatabaseAsync();
    }
}
