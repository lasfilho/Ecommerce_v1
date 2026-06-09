using Ecommerce.Modules.Orders.Domain.Enums;

namespace Ecommerce.Modules.Orders.Application.Models;

public sealed record AdminDashboardResponse(
    int TotalProducts,
    int ActiveProducts,
    int LowStockProducts,
    int TotalCategories,
    int TotalOrders,
    int PendingOrders,
    decimal TotalRevenue,
    int TotalUsers,
    int ActiveUsers);

public sealed record AdminOrderSummaryResponse(
    Guid Id,
    Guid UserId,
    string CustomerEmail,
    string CustomerName,
    string OrderNumber,
    OrderStatus Status,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total,
    int ItemCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record PagedAdminOrdersResponse(
    IReadOnlyList<AdminOrderSummaryResponse> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
