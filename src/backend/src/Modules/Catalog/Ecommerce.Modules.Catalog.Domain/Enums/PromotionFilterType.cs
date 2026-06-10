namespace Ecommerce.Modules.Catalog.Domain.Enums;

/// <summary>Define como os produtos são selecionados automaticamente para a promoção.</summary>
public enum PromotionFilterType
{
    AllProducts = 0,
    HasDiscount = 1,
    Category = 2,
    MinPrice = 3,
    Keywords = 4,
    ProductIds = 5
}
