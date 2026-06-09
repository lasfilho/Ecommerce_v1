namespace Ecommerce.Modules.Catalog.Domain.Entities;

/// <summary>Categoria de produtos — suporta hierarquia via ParentCategoryId.</summary>
public sealed class Category : Shared.Domain.AuditableEntity<Guid>, Shared.Domain.ISoftDeletable
{
    private readonly List<Product> _products = [];

    private Category()
    {
    }

    public Category(
        Guid id,
        string name,
        string slug,
        string? description,
        Guid? parentCategoryId,
        DateTime createdAt)
        : base(id, createdAt)
    {
        Name = name;
        Slug = slug;
        Description = description;
        ParentCategoryId = parentCategoryId;
        IsActive = true;
    }

    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? ParentCategoryId { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    public Category? ParentCategory { get; private set; }
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    public void Update(
        string name,
        string slug,
        string? description,
        Guid? parentCategoryId,
        DateTime updatedAt)
    {
        Name = name;
        Slug = slug;
        Description = description;
        ParentCategoryId = parentCategoryId;
        MarkUpdated(updatedAt);
    }

    public void SetActive(bool isActive, DateTime updatedAt)
    {
        IsActive = isActive;
        MarkUpdated(updatedAt);
    }
}
