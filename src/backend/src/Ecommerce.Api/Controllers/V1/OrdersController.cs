using Asp.Versioning;
using Ecommerce.Api.Contracts.Orders;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Orders.Application.Models;
using Ecommerce.Modules.Orders.Application.Orders.CreateOrderFromCart;
using Ecommerce.Modules.Orders.Application.Orders.GetOrderById;
using Ecommerce.Modules.Orders.Application.Orders.ListUserOrders;
using Ecommerce.Modules.Orders.Application.Orders.UpdateOrderStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Pedidos do e-commerce.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/orders")]
[Authorize]
public sealed class OrdersController(ISender sender) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(OrderDetailResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFromCart(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateOrderFromCartCommand(), cancellationToken);

        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Value!.Id, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1.0" },
            result.Value);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedOrdersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] ListOrdersQueryParams query,
        CancellationToken cancellationToken)
    {
        var orders = await sender.Send(
            new ListUserOrdersQuery(query.Page, query.PageSize),
            cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var order = await sender.Send(new GetOrderByIdQuery(id), cancellationToken);
        return Ok(order);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(OrderDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateOrderStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateOrderStatusCommand(id, request.Status),
            cancellationToken);

        return this.ToActionResult(result);
    }
}
