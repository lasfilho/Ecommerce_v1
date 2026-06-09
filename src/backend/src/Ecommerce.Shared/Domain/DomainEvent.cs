namespace Ecommerce.Shared.Domain;

/// <summary>Implementação base de evento de domínio com timestamp UTC.</summary>
public abstract record DomainEvent : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
