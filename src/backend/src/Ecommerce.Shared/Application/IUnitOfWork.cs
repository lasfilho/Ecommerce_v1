namespace Ecommerce.Shared.Application;

/// <summary>Executa operações dentro de uma transação de banco de dados.</summary>
public interface IUnitOfWork
{
    Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken = default);
}
