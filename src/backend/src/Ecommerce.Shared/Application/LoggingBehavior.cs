using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Shared.Application;

/// <summary>Pipeline behavior que registra início, fim e duração de cada request MediatR.</summary>
public sealed class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        logger.LogInformation("Handling {RequestName} {@Request}", requestName, request);

        var response = await next();

        logger.LogInformation("Handled {RequestName}", requestName);

        return response;
    }
}
