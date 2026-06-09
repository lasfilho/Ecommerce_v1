using Ecommerce.Modules.Cart.Application.Abstractions;
using Ecommerce.Modules.Cart.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using CartEntity = Ecommerce.Modules.Cart.Domain.Entities.Cart;

namespace Ecommerce.Infrastructure.Persistence.Cart;

internal sealed class CartDbContextAdapter(EcommerceDbContext dbContext) : ICartDbContext
{
    public DbSet<CartEntity> Carts => dbContext.Carts;
    public DbSet<CartItem> CartItems => dbContext.CartItems;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
