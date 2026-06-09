using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Cart.Application.Common;
using Ecommerce.Modules.Cart.Application.Mapping;
using Ecommerce.Modules.Cart.Application.Models;
using Ecommerce.Modules.Cart.Application.Services;
using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Shared.Application;
using MediatR;

namespace Ecommerce.Modules.Cart.Application.Cart.GetCurrentCart;

public sealed record GetCurrentCartQuery : IQuery<CartResponse>;

public sealed class GetCurrentCartQueryHandler(
    ICartDbContext cartDb,
    ICatalogDbContext catalogDb,
    ICurrentUserService currentUser)
    : IRequestHandler<GetCurrentCartQuery, CartResponse>
{
    public async Task<CartResponse> Handle(
        GetCurrentCartQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var cart = await CartResolver.GetOrCreateActiveCartAsync(cartDb, userId, cancellationToken);

        var productsResult = await CartPricingService.LoadProductsAsync(
            catalogDb,
            cart.Items.Select(i => i.ProductId),
            cancellationToken);

        var products = productsResult.Value!;
        var refreshResult = CartPricingService.RefreshCartPrices(cart, products);
        if (refreshResult.IsSuccess && cart.Items.Count > 0)
        {
            await cartDb.SaveChangesAsync(cancellationToken);
        }

        return CartMapper.ToResponse(cart, products);
    }
}
