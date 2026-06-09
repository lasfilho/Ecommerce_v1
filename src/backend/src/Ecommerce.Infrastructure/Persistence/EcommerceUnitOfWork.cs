using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Shared.Application;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence;

/// <summary>Unit of Work sobre o DbContext central — garante atomicidade cross-módulo.</summary>
internal sealed class EcommerceUnitOfWork(EcommerceDbContext dbContext) : IUnitOfWork
{
    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken = default)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var result = await action(cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return result;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
    }
}
