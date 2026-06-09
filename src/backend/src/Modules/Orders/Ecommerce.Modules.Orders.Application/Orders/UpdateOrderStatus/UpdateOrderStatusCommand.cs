using Ecommerce.Modules.Orders.Application.Abstractions;
using Ecommerce.Modules.Orders.Application.Mapping;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Modules.Orders.Domain.Enums;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application.Orders.UpdateOrderStatus;

public sealed record UpdateOrderStatusCommand(Guid OrderId, OrderStatus Status) : ICommand<OrderDetailResponse>;

public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
    }
}

public sealed class UpdateOrderStatusCommandHandler(IOrdersDbContext ordersDb)
    : IRequestHandler<UpdateOrderStatusCommand, Result<OrderDetailResponse>>
{
    public async Task<Result<OrderDetailResponse>> Handle(
        UpdateOrderStatusCommand request,
        CancellationToken cancellationToken)
    {
        var order = await ordersDb.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            return Result.Failure<OrderDetailResponse>(
                Error.NotFound("Orders.NotFound", "Pedido não encontrado."));
        }

        if (!order.CanTransitionTo(request.Status))
        {
            return Result.Failure<OrderDetailResponse>(
                Error.Validation(
                    "Orders.InvalidStatusTransition",
                    $"Transição inválida: {order.Status} → {request.Status}."));
        }

        try
        {
            order.UpdateStatus(request.Status, DateTime.UtcNow);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<OrderDetailResponse>(
                Error.Validation("Orders.InvalidStatusTransition", ex.Message));
        }

        await ordersDb.SaveChangesAsync(cancellationToken);

        return Result.Success(OrderMapper.ToDetail(order));
    }
}
