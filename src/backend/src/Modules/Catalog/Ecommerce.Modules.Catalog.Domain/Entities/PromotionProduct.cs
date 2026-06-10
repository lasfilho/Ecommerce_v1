namespace Ecommerce.Modules.Catalog.Domain.Entities;

/// <summary>Vínculo explícito promoção ↔ produto (filtro ProductIds).</summary>
public sealed class PromotionProduct
{
    private PromotionProduct()
    {
    }

    public PromotionProduct(Guid promotionId, Guid productId)
    {
        PromotionId = promotionId;
        ProductId = productId;
    }

    public Guid PromotionId { get; private set; }
    public Guid ProductId { get; private set; }
}
