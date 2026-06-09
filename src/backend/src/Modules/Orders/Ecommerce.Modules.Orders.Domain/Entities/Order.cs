using Ecommerce.Modules.Orders.Domain.Enums;

namespace Ecommerce.Modules.Orders.Domain.Entities;

/// <summary>Pedido — registro imutável de negócio com snapshot de itens e preços.</summary>
public sealed class Order : Shared.Domain.AuditableEntity<Guid>
{
    private readonly List<OrderItem> _items = [];

    private Order()
    {
    }

    private Order(
        Guid id,
        Guid userId,
        Guid cartId,
        string orderNumber,
        OrderStatus status,
        decimal subtotal,
        decimal shippingCost,
        decimal total,
        DateTime createdAt)
        : base(id, createdAt)
    {
        UserId = userId;
        CartId = cartId;
        OrderNumber = orderNumber;
        Status = status;
        Subtotal = subtotal;
        ShippingCost = shippingCost;
        Total = total;
    }

    public Guid UserId { get; private set; }
    public Guid CartId { get; private set; }
    public string OrderNumber { get; private set; } = string.Empty;
    public OrderStatus Status { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal ShippingCost { get; private set; }
    public decimal Total { get; private set; }

    public DateTime? PaidAt { get; private set; }
    public DateTime? ProcessingAt { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }

    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    public static Order CreateFromCart(
        Guid id,
        Guid userId,
        Guid cartId,
        string orderNumber,
        decimal shippingCost,
        IEnumerable<OrderItem> items,
        DateTime createdAt)
    {
        var itemList = items.ToList();
        if (itemList.Count == 0)
        {
            throw new InvalidOperationException("Pedido deve conter ao menos um item.");
        }

        var subtotal = itemList.Sum(i => i.LineTotal);
        var order = new Order(
            id,
            userId,
            cartId,
            orderNumber,
            OrderStatus.Pending,
            subtotal,
            shippingCost,
            subtotal + shippingCost,
            createdAt);

        order._items.AddRange(itemList);
        return order;
    }

    public bool CanTransitionTo(OrderStatus newStatus) =>
        OrderStatusTransitions.IsAllowed(Status, newStatus);

    public void UpdateStatus(OrderStatus newStatus, DateTime updatedAt)
    {
        if (!CanTransitionTo(newStatus))
        {
            throw new InvalidOperationException(
                $"Transição de status inválida: {Status} → {newStatus}.");
        }

        Status = newStatus;
        MarkUpdated(updatedAt);

        switch (newStatus)
        {
            case OrderStatus.Paid:
                PaidAt = updatedAt;
                break;
            case OrderStatus.Processing:
                ProcessingAt = updatedAt;
                break;
            case OrderStatus.Shipped:
                ShippedAt = updatedAt;
                break;
            case OrderStatus.Delivered:
                DeliveredAt = updatedAt;
                break;
            case OrderStatus.Cancelled:
                CancelledAt = updatedAt;
                break;
        }
    }
}
