using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Cart.Domain.Enums;
using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Shared.Application;
using Microsoft.EntityFrameworkCore;
using CartEntity = Ecommerce.Modules.Cart.Domain.Entities.Cart;

namespace Ecommerce.Modules.Cart.Application.Services;

internal static class CartResolver
{
    public static async Task<CartEntity> GetOrCreateActiveCartAsync(
        ICartDbContext cartDb,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var cart = await cartDb.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(
                c => c.UserId == userId && c.Status == CartStatus.Active,
                cancellationToken);

        if (cart is not null)
        {
            return cart;
        }

        cart = new CartEntity(Guid.NewGuid(), userId, DateTime.UtcNow);
        cartDb.Carts.Add(cart);
        await cartDb.SaveChangesAsync(cancellationToken);

        return cart;
    }
}

public static class CartPricingService
{
    public static async Task<Result<IReadOnlyDictionary<Guid, Product>>> LoadProductsAsync(
        ICatalogDbContext catalogDb,
        IEnumerable<Guid> productIds,
        CancellationToken cancellationToken)
    {
        var ids = productIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return Result.Success<IReadOnlyDictionary<Guid, Product>>(
                new Dictionary<Guid, Product>());
        }

        var products = await catalogDb.Products
            .Where(p => ids.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        return Result.Success<IReadOnlyDictionary<Guid, Product>>(products);
    }

    public static Result RefreshCartPrices(
        CartEntity cart,
        IReadOnlyDictionary<Guid, Product> products)
    {
        foreach (var item in cart.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product) || !product.IsActive)
            {
                return Result.Failure(
                    Error.Validation(
                        "Cart.ProductUnavailable",
                        $"Produto {item.ProductId} não está disponível."));
            }

            item.RefreshUnitPrice(product.EffectivePrice);
        }

        return Result.Success();
    }
}
