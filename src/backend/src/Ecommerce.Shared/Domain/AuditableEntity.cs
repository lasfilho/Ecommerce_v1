namespace Ecommerce.Shared.Domain;

/// <summary>Entidade auditável com timestamps de criação e atualização.</summary>
public abstract class AuditableEntity<TId> : Entity<TId>
    where TId : notnull
{
    public DateTime CreatedAt { get; protected set; }
    public DateTime? UpdatedAt { get; protected set; }

    protected AuditableEntity()
    {
    }

    protected AuditableEntity(TId id, DateTime createdAt)
    {
        Id = id;
        CreatedAt = createdAt;
    }

    public void MarkUpdated(DateTime updatedAt) => UpdatedAt = updatedAt;
}
