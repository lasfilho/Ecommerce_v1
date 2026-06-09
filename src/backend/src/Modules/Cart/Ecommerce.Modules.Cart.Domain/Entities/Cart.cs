namespace Ecommerce.Modules.Cart.Domain.Entities;

/// <summary>Carrinho de compras — agregado raiz (usuário autenticado).</summary>
public sealed class Cart : Shared.Domain.AuditableEntity<Guid>
{
    private readonly List<CartItem> _items = [];

    private Cart()
    {
    }

    public Cart(Guid id, Guid userId, DateTime createdAt)
        : base(id, createdAt)
    {
        UserId = userId;
        Status = Enums.CartStatus.Active;
    }

    public Guid UserId { get; private set; }
    public Enums.CartStatus Status { get; private set; }

    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

    public decimal Subtotal => _items.Sum(i => i.LineTotal);

    public int TotalItems => _items.Sum(i => i.Quantity);

    public bool IsEmpty => _items.Count == 0;

    public void AddOrUpdateItem(Guid productId, int quantity, decimal unitPrice, DateTime updatedAt)
    {
        if (quantity <= 0)
        {
            throw new InvalidOperationException("Quantidade deve ser maior que zero.");
        }

        var existing = _items.FirstOrDefault(i => i.ProductId == productId);
        if (existing is not null)
        {
            existing.UpdateQuantity(existing.Quantity + quantity, unitPrice);
        }
        else
        {
            _items.Add(new CartItem(Guid.NewGuid(), Id, productId, quantity, unitPrice));
        }

        MarkUpdated(updatedAt);
    }

    public void SetItemQuantity(Guid productId, int quantity, decimal unitPrice, DateTime updatedAt)
    {
        if (quantity <= 0)
        {
            throw new InvalidOperationException("Quantidade deve ser maior que zero.");
        }

        var item = _items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw new InvalidOperationException("Item não encontrado no carrinho.");

        item.UpdateQuantity(quantity, unitPrice);
        MarkUpdated(updatedAt);
    }

    public void RemoveItem(Guid productId, DateTime updatedAt)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item is null)
        {
            return;
        }

        _items.Remove(item);
        MarkUpdated(updatedAt);
    }

    public void Clear(DateTime updatedAt)
    {
        _items.Clear();
        MarkUpdated(updatedAt);
    }

    public void MarkConverted(DateTime updatedAt)
    {
        Status = Enums.CartStatus.Converted;
        MarkUpdated(updatedAt);
    }
}
