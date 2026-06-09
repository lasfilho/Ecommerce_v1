using Ecommerce.Modules.Orders.Domain.Enums;

namespace Ecommerce.Api.Contracts.Orders;

public sealed record UpdateOrderStatusRequest(OrderStatus Status);

public sealed record ListOrdersQueryParams(int Page = 1, int PageSize = 20);
