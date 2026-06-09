using Ecommerce.Modules.Cart.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using CartEntity = Ecommerce.Modules.Cart.Domain.Entities.Cart;

namespace Ecommerce.Modules.Cart.Application.Abstractions;

/// <summary>Porta de persistência do módulo Cart.</summary>
public interface ICartDbContext
{
    DbSet<CartEntity> Carts { get; }
    DbSet<CartItem> CartItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
