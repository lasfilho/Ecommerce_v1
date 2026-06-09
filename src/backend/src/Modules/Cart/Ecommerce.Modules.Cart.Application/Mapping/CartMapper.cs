using CartEntity = Ecommerce.Modules.Cart.Domain.Entities.Cart;
using Ecommerce.Modules.Cart.Application.Models;
using Ecommerce.Modules.Catalog.Domain.Entities;

namespace Ecommerce.Modules.Cart.Application.Mapping;

internal static class CartMapper
{
    public static CartResponse ToResponse(
        CartEntity cart,
        IReadOnlyDictionary<Guid, Product> products)
    {
        var items = cart.Items
            .Select(item =>
            {
                products.TryGetValue(item.ProductId, out var product);
                var isAvailable = product is { IsActive: true };
                var availableStock = product?.StockQuantity ?? 0;

                return new CartItemResponse(
                    item.Id,
                    item.ProductId,
                    product?.Name ?? "Produto indisponível",
                    product?.Slug ?? string.Empty,
                    product?.Sku ?? string.Empty,
                    item.Quantity,
                    item.UnitPrice,
                    item.LineTotal,
                    isAvailable,
                    availableStock);
            })
            .OrderBy(i => i.ProductName)
            .ToList();

        return new CartResponse(
            cart.Id,
            cart.Status,
            items,
            cart.Subtotal,
            cart.TotalItems,
            cart.CreatedAt,
            cart.UpdatedAt);
    }
}
