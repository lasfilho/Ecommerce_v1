using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Mapping;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Orders.GetOrderById;

public sealed record GetOrderByIdQuery(Guid OrderId) : IQuery<OrderDetailResponse>;

public sealed class GetOrderByIdQueryValidator : AbstractValidator<GetOrderByIdQuery>
{
    public GetOrderByIdQueryValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
    }
}

public sealed class GetOrderByIdQueryHandler(
    IOrdersDbContext ordersDb,
    ICurrentUserService currentUser)
    : IRequestHandler<GetOrderByIdQuery, OrderDetailResponse>
{
    public async Task<OrderDetailResponse> Handle(
        GetOrderByIdQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || currentUser.UserId is null)
        {
            throw new BusinessException("Auth.Unauthorized", "Usuário não autenticado.", 401);
        }

        var order = await ordersDb.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            throw new BusinessException("Orders.NotFound", "Pedido não encontrado.", 404);
        }

        var isAdmin = currentUser.Roles.Contains("Admin");
        if (!isAdmin && order.UserId != currentUser.UserId)
        {
            throw new BusinessException("Orders.Forbidden", "Acesso negado a este pedido.", 403);
        }

        return OrderMapper.ToDetail(order);
    }
}
