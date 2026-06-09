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
        string? shortDescription,
        string? longDescription,
        decimal price,
        decimal? promotionalPrice,
        int stockQuantity,
        DateTime createdAt)
        : base(id, createdAt)
    {
        CategoryId = categoryId;
        Name = name;
        Slug = slug;
        Sku = sku;
        ShortDescription = shortDescription;
        LongDescription = longDescription;
        Price = price;
        PromotionalPrice = promotionalPrice;
        StockQuantity = stockQuantity;
        IsActive = true;
    }

    public Guid CategoryId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public string? ShortDescription { get; private set; }
    public string? LongDescription { get; private set; }
    public decimal Price { get; private set; }
    public decimal? PromotionalPrice { get; private set; }
    public int StockQuantity { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    public Category Category { get; private set; } = null!;
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();

    public decimal EffectivePrice => PromotionalPrice ?? Price;

    public bool HasStock(int quantity) => StockQuantity >= quantity;

    public void Update(
        Guid categoryId,
        string name,
        string slug,
        string sku,
        string? shortDescription,
        string? longDescription,
        decimal price,
        decimal? promotionalPrice,
        int stockQuantity,
        DateTime updatedAt)
    {
        CategoryId = categoryId;
        Name = name;
        Slug = slug;
        Sku = sku;
        ShortDescription = shortDescription;
        LongDescription = longDescription;
        Price = price;
        PromotionalPrice = promotionalPrice;
        StockQuantity = stockQuantity;
        MarkUpdated(updatedAt);
    }

    public void SetActive(bool isActive, DateTime updatedAt)
    {
        IsActive = isActive;
        MarkUpdated(updatedAt);
    }

    public void AddImage(ProductImage image) => _images.Add(image);

    public void ReplaceImages(IEnumerable<ProductImage> images)
    {
        _images.Clear();
        _images.AddRange(images);
    }

    public void MarkDeleted(DateTime deletedAt)
    {
        IsDeleted = true;
        DeletedAt = deletedAt;
        IsActive = false;
        MarkUpdated(deletedAt);
    }

    public void DecreaseStock(int quantity, DateTime updatedAt)
    {
        if (quantity <= 0)
        {
            throw new InvalidOperationException("Quantidade deve ser maior que zero.");
        }

        if (!HasStock(quantity))
        {
            throw new InvalidOperationException("Estoque insuficiente.");
        }

        StockQuantity -= quantity;
        MarkUpdated(updatedAt);
    }
}
