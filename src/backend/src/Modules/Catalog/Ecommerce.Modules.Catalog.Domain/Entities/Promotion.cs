using Ecommerce.Modules.Catalog.Domain.Enums;

namespace Ecommerce.Modules.Catalog.Domain.Entities;

/// <summary>Campanha promocional exibida no carrossel e na listagem filtrada.</summary>
public sealed class Promotion : Shared.Domain.AuditableEntity<Guid>
{
    private readonly List<PromotionProduct> _products = [];

    private Promotion()
    {
    }

    public Promotion(
        Guid id,
        string slug,
        string tag,
        string title,
        string subtitle,
        string? highlight,
        string? highlightLabel,
        string backgroundClass,
        PromotionFilterType filterType,
        Guid? categoryId,
        decimal? minPrice,
        string? keywords,
        int displayOrder,
        DateTime? startsAt,
        DateTime? endsAt,
        DateTime createdAt)
        : base(id, createdAt)
    {
        Slug = slug;
        Tag = tag;
        Title = title;
        Subtitle = subtitle;
        Highlight = highlight;
        HighlightLabel = highlightLabel;
        BackgroundClass = backgroundClass;
        FilterType = filterType;
        CategoryId = categoryId;
        MinPrice = minPrice;
        Keywords = keywords;
        DisplayOrder = displayOrder;
        StartsAt = startsAt;
        EndsAt = endsAt;
        IsActive = true;
    }

    public string Slug { get; private set; } = string.Empty;
    public string Tag { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Subtitle { get; private set; } = string.Empty;
    public string? Highlight { get; private set; }
    public string? HighlightLabel { get; private set; }
    public string BackgroundClass { get; private set; } = string.Empty;
    public PromotionFilterType FilterType { get; private set; }
    public Guid? CategoryId { get; private set; }
    public decimal? MinPrice { get; private set; }
    public string? Keywords { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? StartsAt { get; private set; }
    public DateTime? EndsAt { get; private set; }

    public IReadOnlyCollection<PromotionProduct> Products => _products.AsReadOnly();

    public bool IsCurrentlyActive(DateTime utcNow) =>
        IsActive
        && (StartsAt is null || StartsAt <= utcNow)
        && (EndsAt is null || EndsAt >= utcNow);

    public void Update(
        string tag,
        string title,
        string subtitle,
        string? highlight,
        string? highlightLabel,
        string backgroundClass,
        PromotionFilterType filterType,
        Guid? categoryId,
        decimal? minPrice,
        string? keywords,
        int displayOrder,
        DateTime? startsAt,
        DateTime? endsAt,
        DateTime updatedAt)
    {
        Tag = tag;
        Title = title;
        Subtitle = subtitle;
        Highlight = highlight;
        HighlightLabel = highlightLabel;
        BackgroundClass = backgroundClass;
        FilterType = filterType;
        CategoryId = categoryId;
        MinPrice = minPrice;
        Keywords = keywords;
        DisplayOrder = displayOrder;
        StartsAt = startsAt;
        EndsAt = endsAt;
        MarkUpdated(updatedAt);
    }

    public void SetActive(bool isActive, DateTime updatedAt)
    {
        IsActive = isActive;
        MarkUpdated(updatedAt);
    }

    public void ReplaceProducts(IEnumerable<Guid> productIds)
    {
        _products.Clear();
        foreach (var productId in productIds.Distinct())
        {
            _products.Add(new PromotionProduct(Id, productId));
        }
    }
}
