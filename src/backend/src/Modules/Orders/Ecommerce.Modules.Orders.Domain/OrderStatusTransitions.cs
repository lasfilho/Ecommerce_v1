namespace Ecommerce.Modules.Orders.Domain;

using Ecommerce.Modules.Orders.Domain.Enums;

/// <summary>Regras de transição de status de pedido.</summary>
public static class OrderStatusTransitions
{
    private static readonly Dictionary<OrderStatus, HashSet<OrderStatus>> Allowed = new()
    {
        [OrderStatus.Pending] = [OrderStatus.Paid, OrderStatus.Cancelled],
        [OrderStatus.Paid] = [OrderStatus.Processing, OrderStatus.Cancelled],
        [OrderStatus.Processing] = [OrderStatus.Shipped, OrderStatus.Cancelled],
        [OrderStatus.Shipped] = [OrderStatus.Delivered],
        [OrderStatus.Delivered] = [],
        [OrderStatus.Cancelled] = []
    };

    public static bool IsAllowed(OrderStatus current, OrderStatus next) =>
        Allowed.TryGetValue(current, out var targets) && targets.Contains(next);
}
