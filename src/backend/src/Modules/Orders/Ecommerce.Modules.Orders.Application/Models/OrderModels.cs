using Ecommerce.Modules.Orders.Domain.Enums;

namespace Ecommerce.Modules.Orders.Application.Models;

public sealed record OrderItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string Sku,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public sealed record OrderStatusDatesResponse(
    DateTime? PaidAt,
    DateTime? ProcessingAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? CancelledAt);

public sealed record OrderSummaryResponse(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total,
    int ItemCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record OrderDetailResponse(
    Guid Id,
    Guid CartId,
    string OrderNumber,
    OrderStatus Status,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total,
    IReadOnlyList<OrderItemResponse> Items,
    OrderStatusDatesResponse StatusDates,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record PagedOrdersResponse(
    IReadOnlyList<OrderSummaryResponse> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
