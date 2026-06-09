using Asp.Versioning;
using Ecommerce.Api.Contracts.Admin;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Identity.Application.Admin.ListUsers;
using Ecommerce.Modules.Identity.Application.Admin.SetUserStatus;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Modules.Orders.Application.Admin.GetDashboard;
using Ecommerce.Modules.Orders.Application.Admin.ListAllOrders;
using Ecommerce.Modules.Orders.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Operações administrativas do e-commerce.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin")]
[Authorize(Policy = "AdminOnly")]
public sealed class AdminController(ISender sender) : ControllerBase
{
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(AdminDashboardResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await sender.Send(new GetAdminDashboardQuery(), cancellationToken);
        return Ok(dashboard);
    }

    [HttpGet("orders")]
    [ProducesResponseType(typeof(PagedAdminOrdersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListOrders(
        [FromQuery] ListAdminOrdersQueryParams query,
        CancellationToken cancellationToken)
    {
        var orders = await sender.Send(
            new ListAllOrdersQuery(query.Page, query.PageSize, query.Status),
            cancellationToken);

        return Ok(orders);
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(PagedUsersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListUsers(
        [FromQuery] ListUsersQueryParams query,
        CancellationToken cancellationToken)
    {
        var users = await sender.Send(
            new ListUsersQuery(query.Page, query.PageSize),
            cancellationToken);

        return Ok(users);
    }

    [HttpPatch("users/{id:guid}/status")]
    [ProducesResponseType(typeof(AdminUserListItemResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetUserStatus(
        Guid id,
        [FromBody] SetUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new SetUserStatusCommand(id, request.IsActive),
            cancellationToken);

        return this.ToActionResult(result);
    }
}
