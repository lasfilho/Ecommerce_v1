using Ecommerce.Shared.Application;
using MediatR;

namespace Ecommerce.Modules.Orders.Application.Modules;

public sealed record GetOrdersStatusQuery : IQuery<OrdersStatusResponse>;

public sealed record OrdersStatusResponse(string Module, string Status);

public sealed class GetOrdersStatusQueryHandler
    : IRequestHandler<GetOrdersStatusQuery, OrdersStatusResponse>
{
    public Task<OrdersStatusResponse> Handle(
        GetOrdersStatusQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(new OrdersStatusResponse("Orders", "Ready"));
}
