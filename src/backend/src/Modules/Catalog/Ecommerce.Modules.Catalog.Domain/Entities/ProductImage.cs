namespace Ecommerce.Modules.Catalog.Domain.Entities;

/// <summary>Imagem associada a um produto.</summary>
public sealed class ProductImage : Shared.Domain.Entity<Guid>
{
    private ProductImage()
    {
    }

    public ProductImage(
        Guid id,
        Guid productId,
        string url,
        string? altText,
        int displayOrder,
        bool isPrimary)
    {
        Id = id;
        ProductId = productId;
        Url = url;
        AltText = altText;
        DisplayOrder = displayOrder;
        IsPrimary = isPrimary;
    }

    public Guid ProductId { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public string? AltText { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsPrimary { get; private set; }

    public Product Product { get; private set; } = null!;
}
