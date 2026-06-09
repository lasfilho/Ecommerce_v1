using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Domain.Constants;
using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Modules.Orders.Domain.Enums;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Admin.ListAllOrders;

public sealed record ListAllOrdersQuery(
    int Page,
    int PageSize,
    OrderStatus? Status) : IQuery<PagedAdminOrdersResponse>;

public sealed class ListAllOrdersQueryValidator : AbstractValidator<ListAllOrdersQuery>
{
    public ListAllOrdersQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}

public sealed class ListAllOrdersQueryHandler(
    IOrdersDbContext ordersDb,
    IIdentityDbContext identityDb,
    ICurrentUserService currentUser)
    : IRequestHandler<ListAllOrdersQuery, PagedAdminOrdersResponse>
{
    public async Task<PagedAdminOrdersResponse> Handle(
        ListAllOrdersQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.Roles.Contains(RoleNames.Admin))
        {
            throw new BusinessException("Auth.Forbidden", "Acesso restrito a administradores.", 403);
        }

        var query = ordersDb.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsQueryable();

        if (request.Status.HasValue)
        {
            query = query.Where(o => o.Status == request.Status.Value);
        }

        query = query.OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var orders = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var userIds = orders.Select(o => o.UserId).Distinct().ToList();
        var users = await identityDb.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        var items = orders.Select(order =>
        {
            users.TryGetValue(order.UserId, out var user);
            var customerName = user is null
                ? "Cliente"
                : $"{user.FirstName} {user.LastName}".Trim();
            var customerEmail = user?.Email ?? "—";

            return new AdminOrderSummaryResponse(
                order.Id,
                order.UserId,
                customerEmail,
                customerName,
                order.OrderNumber,
                order.Status,
                order.Subtotal,
                order.ShippingCost,
                order.Total,
                order.Items.Sum(i => i.Quantity),
                order.CreatedAt,
                order.UpdatedAt);
        }).ToList();

        return new PagedAdminOrdersResponse(
            items,
            request.Page,
            request.PageSize,
            totalCount,
            totalPages);
    }
}
