using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Cart.Application.Common;
using Ecommerce.Modules.Cart.Application.Mapping;
using Ecommerce.Modules.Cart.Application.Models;
using Ecommerce.Modules.Cart.Application.Services;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Shared.Application;
using MediatR;

namespace Ecommerce.Modules.Cart.Application.Cart.ClearCart;

public sealed record ClearCartCommand : ICommand<CartResponse>;

public sealed class ClearCartCommandHandler(
    ICartDbContext cartDb,
    ICurrentUserService currentUser)
    : IRequestHandler<ClearCartCommand, Result<CartResponse>>
{
    public async Task<Result<CartResponse>> Handle(
        ClearCartCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var cart = await CartResolver.GetOrCreateActiveCartAsync(cartDb, userId, cancellationToken);
        cart.Clear(DateTime.UtcNow);
        await cartDb.SaveChangesAsync(cancellationToken);

        return Result.Success(CartMapper.ToResponse(cart, new Dictionary<Guid, Product>()));
    }
}
