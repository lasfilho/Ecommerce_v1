using Asp.Versioning;
using Ecommerce.Api.Contracts.Cart;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Cart.Application.Cart.AddCartItem;
using Ecommerce.Modules.Cart.Application.Cart.ClearCart;
using Ecommerce.Modules.Cart.Application.Cart.GetCurrentCart;
using Ecommerce.Modules.Cart.Application.Cart.RemoveCartItem;
using Ecommerce.Modules.Cart.Application.Cart.UpdateCartItemQuantity;
using Ecommerce.Modules.Cart.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Carrinho de compras do usuário autenticado.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/cart")]
[Authorize]
public sealed class CartController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrent(CancellationToken cancellationToken)
    {
        var cart = await sender.Send(new GetCurrentCartQuery(), cancellationToken);
        return Ok(cart);
    }

    [HttpPost("items/{productId:guid}")]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddItem(
        Guid productId,
        [FromBody] AddCartItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new AddCartItemCommand(productId, request.Quantity),
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpPut("items/{productId:guid}")]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateItemQuantity(
        Guid productId,
        [FromBody] UpdateCartItemQuantityRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateCartItemQuantityCommand(productId, request.Quantity),
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpDelete("items/{productId:guid}")]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveItem(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RemoveCartItemCommand(productId), cancellationToken);
        return this.ToActionResult(result);
    }

    [HttpDelete]
    [ProducesResponseType(typeof(CartResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ClearCartCommand(), cancellationToken);
        return this.ToActionResult(result);
    }
}
