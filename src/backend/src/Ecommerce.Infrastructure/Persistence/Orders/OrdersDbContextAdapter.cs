using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Orders;

internal sealed class OrdersDbContextAdapter(EcommerceDbContext dbContext) : IOrdersDbContext
{
    public DbSet<Order> Orders => dbContext.Orders;
    public DbSet<OrderItem> OrderItems => dbContext.OrderItems;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
