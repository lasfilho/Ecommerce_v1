using Asp.Versioning;
using Ecommerce.Modules.Cart.Application.Modules;
using Ecommerce.Modules.Catalog.Application.Modules;
using Ecommerce.Modules.Identity.Application.Modules;
using Ecommerce.Modules.Orders.Application.Modules;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Endpoints de diagnóstico dos módulos — substituir por controllers de negócio.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/status")]
public sealed class ModulesStatusController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var catalog = await sender.Send(new GetCatalogStatusQuery(), cancellationToken);
        var cart = await sender.Send(new GetCartStatusQuery(), cancellationToken);
        var orders = await sender.Send(new GetOrdersStatusQuery(), cancellationToken);
        var identity = await sender.Send(new GetIdentityStatusQuery(), cancellationToken);

        return Ok(new
        {
            api = "E-commerce API",
            version = "1.0",
            modules = new object[] { catalog, cart, orders, identity }
        });
    }
}
