namespace Ecommerce.Modules.Catalog.Domain.Entities;

/// <summary>Produto do catálogo — agregado raiz.</summary>
public sealed class Product : Shared.Domain.AuditableEntity<Guid>, Shared.Domain.ISoftDeletable
{
    private readonly List<ProductImage> _images = [];

    private Product()
    {
    }

    public Product(
        Guid id,
        Guid categoryId,
        string name,
        string slug,
        string sku,
        string? description,
        decimal price,
        int stockQuantity,
        DateTime createdAt)
        : base(id, createdAt)
    {
        CategoryId = categoryId;
        Name = name;
        Slug = slug;
        Sku = sku;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        IsActive = true;
    }

    public Guid CategoryId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    public Category Category { get; private set; } = null!;
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();
}
