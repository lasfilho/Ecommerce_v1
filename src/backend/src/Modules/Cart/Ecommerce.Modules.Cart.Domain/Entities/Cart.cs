using Ecommerce.Modules.Cart.Domain.Enums;

namespace Ecommerce.Modules.Cart.Domain.Entities;

/// <summary>Carrinho de compras — agregado raiz (usuário autenticado ou sessão anônima).</summary>
public sealed class Cart : Shared.Domain.AuditableEntity<Guid>
{
    private readonly List<CartItem> _items = [];

    private Cart()
    {
    }

    public Cart(Guid id, Guid? userId, string? sessionId, DateTime createdAt)
        : base(id, createdAt)
    {
        UserId = userId;
        SessionId = sessionId;
        Status = CartStatus.Active;
    }

    public Guid? UserId { get; private set; }
    public string? SessionId { get; private set; }
    public CartStatus Status { get; private set; }

    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();
}
