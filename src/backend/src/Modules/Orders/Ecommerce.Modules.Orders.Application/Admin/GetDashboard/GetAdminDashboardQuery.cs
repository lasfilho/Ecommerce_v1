using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Domain.Constants;
using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Modules.Orders.Domain.Enums;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Admin.GetDashboard;

public sealed record GetAdminDashboardQuery : IQuery<AdminDashboardResponse>;

public sealed class GetAdminDashboardQueryHandler(
    ICatalogDbContext catalogDb,
    IOrdersDbContext ordersDb,
    IIdentityDbContext identityDb,
    ICurrentUserService currentUser)
    : IRequestHandler<GetAdminDashboardQuery, AdminDashboardResponse>
{
    public async Task<AdminDashboardResponse> Handle(
        GetAdminDashboardQuery request,
        CancellationToken cancellationToken)
    {
        EnsureAdmin();

        var totalProducts = await catalogDb.Products.CountAsync(cancellationToken);
        var activeProducts = await catalogDb.Products.CountAsync(p => p.IsActive, cancellationToken);
        var lowStockProducts = await catalogDb.Products.CountAsync(
            p => p.IsActive && p.StockQuantity <= 5,
            cancellationToken);
        var totalCategories = await catalogDb.Categories.CountAsync(c => !c.IsDeleted, cancellationToken);

        var totalOrders = await ordersDb.Orders.CountAsync(cancellationToken);
        var pendingOrders = await ordersDb.Orders.CountAsync(
            o => o.Status == OrderStatus.Pending,
            cancellationToken);
        var totalRevenue = await ordersDb.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => o.Total, cancellationToken);

        var totalUsers = await identityDb.Users.CountAsync(cancellationToken);
        var activeUsers = await identityDb.Users.CountAsync(u => u.IsActive, cancellationToken);

        return new AdminDashboardResponse(
            totalProducts,
            activeProducts,
            lowStockProducts,
            totalCategories,
            totalOrders,
            pendingOrders,
            totalRevenue,
            totalUsers,
            activeUsers);
    }

    private void EnsureAdmin()
    {
        if (!currentUser.Roles.Contains(RoleNames.Admin))
        {
            throw new BusinessException("Auth.Forbidden", "Acesso restrito a administradores.", 403);
        }
    }
}
