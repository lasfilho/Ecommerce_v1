using Ecommerce.Modules.Orders.Domain.Enums;

namespace Ecommerce.Api.Contracts.Admin;

public sealed record ListAdminOrdersQueryParams(
    int Page = 1,
    int PageSize = 20,
    OrderStatus? Status = null);

public sealed record ListUsersQueryParams(int Page = 1, int PageSize = 20);

public sealed record SetUserStatusRequest(bool IsActive);
