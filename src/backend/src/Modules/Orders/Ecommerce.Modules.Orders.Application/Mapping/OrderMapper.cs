using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Modules.Orders.Domain.Entities;

namespace Ecommerce.Modules.Orders.Application.Mapping;

internal static class OrderMapper
{
    public static OrderDetailResponse ToDetail(Order order) =>
        new(
            order.Id,
            order.CartId,
            order.OrderNumber,
            order.Status,
            order.Subtotal,
            order.ShippingCost,
            order.Total,
            order.Items
                .Select(ToItem)
                .OrderBy(i => i.ProductName)
                .ToList(),
            new OrderStatusDatesResponse(
                order.PaidAt,
                order.ProcessingAt,
                order.ShippedAt,
                order.DeliveredAt,
                order.CancelledAt),
            order.CreatedAt,
            order.UpdatedAt);

    public static OrderSummaryResponse ToSummary(Order order) =>
        new(
            order.Id,
            order.OrderNumber,
            order.Status,
            order.Subtotal,
            order.ShippingCost,
            order.Total,
            order.Items.Sum(i => i.Quantity),
            order.CreatedAt,
            order.UpdatedAt);

    private static OrderItemResponse ToItem(OrderItem item) =>
        new(
            item.Id,
            item.ProductId,
            item.ProductName,
            item.Sku,
            item.Quantity,
            item.UnitPrice,
            item.LineTotal);
}
