using Asp.Versioning;
using Ecommerce.Api.Contracts.Catalog;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Catalog.Application.Categories.CreateCategory;
using Ecommerce.Modules.Catalog.Application.Categories.ListCategories;
using Ecommerce.Modules.Catalog.Application.Categories.SetCategoryStatus;
using Ecommerce.Modules.Catalog.Application.Categories.UpdateCategory;
using Ecommerce.Modules.Catalog.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Categorias do catálogo.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/categories")]
public sealed class CategoriesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var categories = await sender.Send(new ListCategoriesQuery(isActive), cancellationToken);
        return Ok(categories);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateCategoryCommand(
                request.Name,
                request.Slug,
                request.Description,
                request.ParentCategoryId),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }

        return CreatedAtAction(
            nameof(List),
            new { version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1.0" },
            result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateCategoryCommand(
                id,
                request.Name,
                request.Slug,
                request.Description,
                request.ParentCategoryId),
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetStatus(
        Guid id,
        [FromBody] SetCategoryStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new SetCategoryStatusCommand(id, request.IsActive),
            cancellationToken);

        return this.ToActionResult(result);
    }
}
