namespace Ecommerce.Infrastructure.Abstractions;

/// <summary>Abstração de relógio para testes e consistência de timestamps.</summary>
public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
