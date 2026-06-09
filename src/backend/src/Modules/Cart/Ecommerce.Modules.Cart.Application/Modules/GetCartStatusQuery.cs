using Ecommerce.Shared.Application;
using MediatR;

namespace Ecommerce.Modules.Cart.Application.Modules;

public sealed record GetCartStatusQuery : IQuery<CartStatusResponse>;

public sealed record CartStatusResponse(string Module, string Status);

public sealed class GetCartStatusQueryHandler
    : IRequestHandler<GetCartStatusQuery, CartStatusResponse>
{
    public Task<CartStatusResponse> Handle(
        GetCartStatusQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(new CartStatusResponse("Cart", "Ready"));
}
