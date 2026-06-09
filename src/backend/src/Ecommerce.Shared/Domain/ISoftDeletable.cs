namespace Ecommerce.Shared.Domain;

/// <summary>Marca entidades que usam soft delete (ex.: catálogo). Pedidos nunca implementam isso.</summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; }
    DateTime? DeletedAt { get; }
}
