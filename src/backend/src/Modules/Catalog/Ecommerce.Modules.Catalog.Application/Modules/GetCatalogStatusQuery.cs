using Ecommerce.Shared.Application;
using MediatR;

namespace Ecommerce.Modules.Catalog.Application.Modules;

/// <summary>Query de exemplo para validar pipeline MediatR do módulo Catalog.</summary>
public sealed record GetCatalogStatusQuery : IQuery<CatalogStatusResponse>;

public sealed record CatalogStatusResponse(string Module, string Status);

public sealed class GetCatalogStatusQueryHandler
    : IRequestHandler<GetCatalogStatusQuery, CatalogStatusResponse>
{
    public Task<CatalogStatusResponse> Handle(
        GetCatalogStatusQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(new CatalogStatusResponse("Catalog", "Ready"));
}
