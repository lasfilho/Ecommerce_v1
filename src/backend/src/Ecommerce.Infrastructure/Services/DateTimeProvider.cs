using Ecommerce.Infrastructure.Abstractions;

namespace Ecommerce.Infrastructure.Services;

/// <summary>Implementação padrão de IDateTimeProvider usando DateTime.UtcNow.</summary>
internal sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
