namespace Ecommerce.Modules.Cart.Domain.Entities;

/// <summary>Item do carrinho com snapshot de preço unitário.</summary>
public sealed class CartItem : Shared.Domain.Entity<Guid>
{
    private CartItem()
    {
    }

    public CartItem(Guid id, Guid cartId, Guid productId, int quantity, decimal unitPrice)
    {
        Id = id;
        CartId = cartId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }

    public Cart Cart { get; private set; } = null!;
}
