namespace Ecommerce.Modules.Orders.Domain.Entities;

/// <summary>Item do pedido com snapshot de produto no momento da compra.</summary>
public sealed class OrderItem : Shared.Domain.Entity<Guid>
{
    private OrderItem()
    {
    }

    public OrderItem(
        Guid id,
        Guid orderId,
        Guid productId,
        string productName,
        string sku,
        int quantity,
        decimal unitPrice,
        decimal lineTotal)
    {
        Id = id;
        OrderId = orderId;
        ProductId = productId;
        ProductName = productName;
        Sku = sku;
        Quantity = quantity;
        UnitPrice = unitPrice;
        LineTotal = lineTotal;
    }

    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal LineTotal { get; private set; }

    public Order Order { get; private set; } = null!;
}
