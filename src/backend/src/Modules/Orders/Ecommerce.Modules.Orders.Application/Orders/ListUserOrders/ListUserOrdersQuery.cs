using Ecommerce.Modules.Cart.Application.Common;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Mapping;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Orders.ListUserOrders;

public sealed record ListUserOrdersQuery(int Page, int PageSize) : IQuery<PagedOrdersResponse>;

public sealed class ListUserOrdersQueryValidator : AbstractValidator<ListUserOrdersQuery>
{
    public ListUserOrdersQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}

public sealed class ListUserOrdersQueryHandler(
    IOrdersDbContext ordersDb,
    ICurrentUserService currentUser)
    : IRequestHandler<ListUserOrdersQuery, PagedOrdersResponse>
{
    public async Task<PagedOrdersResponse> Handle(
        ListUserOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var query = ordersDb.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var orders = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedOrdersResponse(
            orders.Select(OrderMapper.ToSummary).ToList(),
            request.Page,
            request.PageSize,
            totalCount,
            totalPages);
    }
}
