using Ecommerce.Modules.Cart.Application.Abstractions;
using CartEntity = Ecommerce.Modules.Cart.Domain.Entities.Cart;
using Ecommerce.Modules.Cart.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Cart;

internal sealed class CartDbContextAdapter(EcommerceDbContext dbContext) : ICartDbContext
{
    public DbSet<CartEntity> Carts => dbContext.Carts;
    public DbSet<CartItem> CartItems => dbContext.CartItems;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
