using Ecommerce.Modules.Orders.Application.Abstractions;

namespace Ecommerce.Modules.Orders.Infrastructure.Services;

internal sealed class OrderNumberGenerator : IOrderNumberGenerator
{
    public string Generate(DateTime utcNow) =>
        $"ORD-{utcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
}
