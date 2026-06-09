using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Cart.Application.Common;
using Ecommerce.Modules.Cart.Application.Services;
using Ecommerce.Modules.Cart.Domain.Enums;
using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Mapping;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Domain.Entities;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Orders.CreateOrderFromCart;

public sealed record CreateOrderFromCartCommand : ICommand<OrderDetailResponse>;

public sealed class CreateOrderFromCartCommandHandler(
    ICartDbContext cartDb,
    ICatalogDbContext catalogDb,
    IOrdersDbContext ordersDb,
    IOrderNumberGenerator orderNumberGenerator,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser)
    : IRequestHandler<CreateOrderFromCartCommand, Result<OrderDetailResponse>>
{
    public async Task<Result<OrderDetailResponse>> Handle(
        CreateOrderFromCartCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var cart = await cartDb.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(
                c => c.UserId == userId && c.Status == CartStatus.Active,
                cancellationToken);

        if (cart is null || cart.IsEmpty)
        {
            return Result.Failure<OrderDetailResponse>(
                Error.Validation("Orders.EmptyCart", "Carrinho vazio. Adicione itens antes de finalizar."));
        }

        var productIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await catalogDb.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var refreshResult = CartPricingService.RefreshCartPrices(cart, products);
        if (!refreshResult.IsSuccess)
        {
            return Result.Failure<OrderDetailResponse>(refreshResult.Error);
        }

        foreach (var item in cart.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product) || !product.IsActive)
            {
                return Result.Failure<OrderDetailResponse>(
                    Error.Validation(
                        "Orders.ProductUnavailable",
                        $"Produto {item.ProductId} não está disponível."));
            }

            if (!product.HasStock(item.Quantity))
            {
                return Result.Failure<OrderDetailResponse>(
                    Error.Validation(
                        "Orders.InsufficientStock",
                        $"Estoque insuficiente para '{product.Name}'. Disponível: {product.StockQuantity}."));
            }
        }

        var now = DateTime.UtcNow;
        var orderId = Guid.NewGuid();
        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cart.Items)
        {
            var product = products[cartItem.ProductId];
            var unitPrice = product.EffectivePrice;

            orderItems.Add(new OrderItem(
                Guid.NewGuid(),
                orderId,
                product.Id,
                product.Name,
                product.Sku,
                cartItem.Quantity,
                unitPrice,
                unitPrice * cartItem.Quantity));
        }

        var subtotal = orderItems.Sum(i => i.LineTotal);
        var shippingCost = OrderShippingPolicy.Calculate(subtotal);
        var orderNumber = orderNumberGenerator.Generate(now);

        try
        {
            var createdOrder = await unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                var trackedProducts = await catalogDb.Products
                    .Where(p => productIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id, ct);

                foreach (var item in cart.Items)
                {
                    var product = trackedProducts[item.ProductId];
                    product.DecreaseStock(item.Quantity, now);
                }

                var order = Order.CreateFromCart(
                    orderId,
                    userId,
                    cart.Id,
                    orderNumber,
                    shippingCost,
                    orderItems,
                    now);

                ordersDb.Orders.Add(order);
                cart.MarkConverted(now);

                return order;
            }, cancellationToken);

            var persisted = await ordersDb.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                .FirstAsync(o => o.Id == createdOrder.Id, cancellationToken);

            return Result.Success(OrderMapper.ToDetail(persisted));
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Estoque"))
        {
            return Result.Failure<OrderDetailResponse>(
                Error.Validation("Orders.InsufficientStock", ex.Message));
        }
    }
}
