using Ecommerce.Modules.Cart.Domain.Enums;

namespace Ecommerce.Modules.Cart.Application.Models;

public sealed record CartItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    string Sku,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    bool IsAvailable,
    int AvailableStock);

public sealed record CartResponse(
    Guid Id,
    CartStatus Status,
    IReadOnlyList<CartItemResponse> Items,
    decimal Subtotal,
    int TotalItems,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
