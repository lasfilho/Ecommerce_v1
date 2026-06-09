using Ecommerce.Modules.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Abstractions;

/// <summary>Porta de persistência do módulo Orders.</summary>
public interface IOrdersDbContext
{
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

/// <summary>Gera identificadores únicos de pedido.</summary>
public interface IOrderNumberGenerator
{
    string Generate(DateTime utcNow);
}
