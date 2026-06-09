namespace Ecommerce.Shared.Domain;

/// <summary>Contrato base para eventos de domínio publicados por agregados.</summary>
public interface IDomainEvent : MediatR.INotification
{
    DateTime OccurredOn { get; }
}
