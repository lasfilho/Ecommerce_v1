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

namespace Ecommerce.Modules.Cart.Application.Cart.AddCartItem;

public sealed record AddCartItemCommand(Guid ProductId, int Quantity) : ICommand<CartResponse>;

public sealed class AddCartItemCommandValidator : AbstractValidator<AddCartItemCommand>
{
    public AddCartItemCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public sealed class AddCartItemCommandHandler(
    ICartDbContext cartDb,
    ICatalogDbContext catalogDb,
    ICurrentUserService currentUser)
    : IRequestHandler<AddCartItemCommand, Result<CartResponse>>
{
    public async Task<Result<CartResponse>> Handle(
        AddCartItemCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var product = await catalogDb.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, cancellationToken);

        if (product is null)
        {
            return Result.Failure<CartResponse>(
                Error.NotFound("Cart.ProductNotFound", "Produto não encontrado ou inativo."));
        }

        var cart = await CartResolver.GetOrCreateActiveCartAsync(cartDb, userId, cancellationToken);

        var currentQuantity = cart.Items
            .FirstOrDefault(i => i.ProductId == request.ProductId)?.Quantity ?? 0;

        if (!product.HasStock(currentQuantity + request.Quantity))
        {
            return Result.Failure<CartResponse>(
                Error.Validation(
                    "Cart.InsufficientStock",
                    $"Estoque insuficiente. Disponível: {product.StockQuantity}."));
        }

        cart.AddOrUpdateItem(
            request.ProductId,
            request.Quantity,
            product.EffectivePrice,
            DateTime.UtcNow);

        await cartDb.SaveChangesAsync(cancellationToken);

        var products = await catalogDb.Products
            .Where(p => cart.Items.Select(i => i.ProductId).Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        return Result.Success(CartMapper.ToResponse(cart, products));
    }
}
