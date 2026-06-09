using Ecommerce.Shared.Application;
using MediatR;

namespace Ecommerce.Modules.Identity.Application.Modules;

public sealed record GetIdentityStatusQuery : IQuery<IdentityStatusResponse>;

public sealed record IdentityStatusResponse(string Module, string Status);

public sealed class GetIdentityStatusQueryHandler
    : IRequestHandler<GetIdentityStatusQuery, IdentityStatusResponse>
{
    public Task<IdentityStatusResponse> Handle(
        GetIdentityStatusQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(new IdentityStatusResponse("Identity", "Ready"));
}
