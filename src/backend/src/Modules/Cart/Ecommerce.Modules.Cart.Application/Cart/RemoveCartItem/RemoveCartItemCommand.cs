using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Cart.Application.Common;
using Ecommerce.Modules.Cart.Application.Mapping;
using Ecommerce.Modules.Cart.Application.Models;
using Ecommerce.Modules.Cart.Application.Services;
using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Cart.Application.Cart.RemoveCartItem;

public sealed record RemoveCartItemCommand(Guid ProductId) : ICommand<CartResponse>;

public sealed class RemoveCartItemCommandValidator : AbstractValidator<RemoveCartItemCommand>
{
    public RemoveCartItemCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public sealed class RemoveCartItemCommandHandler(
    ICartDbContext cartDb,
    ICatalogDbContext catalogDb,
    ICurrentUserService currentUser)
    : IRequestHandler<RemoveCartItemCommand, Result<CartResponse>>
{
    public async Task<Result<CartResponse>> Handle(
        RemoveCartItemCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var cart = await CartResolver.GetOrCreateActiveCartAsync(cartDb, userId, cancellationToken);
        cart.RemoveItem(request.ProductId, DateTime.UtcNow);
        await cartDb.SaveChangesAsync(cancellationToken);

        var products = await catalogDb.Products
            .Where(p => cart.Items.Select(i => i.ProductId).Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        return Result.Success(CartMapper.ToResponse(cart, products));
    }
}
