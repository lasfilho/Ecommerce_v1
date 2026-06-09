using Ecommerce.Modules.Orders.Domain.Enums;

namespace Ecommerce.Modules.Orders.Domain.Entities;

/// <summary>Pedido — registro imutável de negócio (sem soft delete).</summary>
public sealed class Order : Shared.Domain.AuditableEntity<Guid>
{
    private readonly List<OrderItem> _items = [];

    private Order()
    {
    }

    public Order(
        Guid id,
        Guid userId,
        string orderNumber,
        OrderStatus status,
        decimal subtotal,
        decimal shippingCost,
        decimal total,
        DateTime createdAt)
        : base(id, createdAt)
    {
        UserId = userId;
        OrderNumber = orderNumber;
        Status = status;
        Subtotal = subtotal;
        ShippingCost = shippingCost;
        Total = total;
    }

    public Guid UserId { get; private set; }
    public string OrderNumber { get; private set; } = string.Empty;
    public OrderStatus Status { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal ShippingCost { get; private set; }
    public decimal Total { get; private set; }

    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
}
