namespace Ecommerce.Shared.Domain;

/// <summary>Raiz de agregado — ponto de entrada para consistência transacional do módulo.</summary>
public abstract class AggregateRoot<TId> : Entity<TId>
    where TId : notnull;
