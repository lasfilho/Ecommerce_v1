using Asp.Versioning;
using Ecommerce.Api.Contracts.Catalog;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Application.Products.CreateProduct;
using Ecommerce.Modules.Catalog.Application.Products.GetProductById;
using Ecommerce.Modules.Catalog.Application.Products.ListProducts;
using Ecommerce.Modules.Catalog.Application.Products.SetProductStatus;
using Ecommerce.Modules.Catalog.Application.Products.UpdateProduct;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Produtos do catálogo.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/products")]
public sealed class ProductsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<ProductListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] ListProductsQueryParams query,
        CancellationToken cancellationToken)
    {
        var isActive = ResolveIsActiveFilter(query.IsActive);

        var result = await sender.Send(
            new ListProductsQuery(
                query.Page,
                query.PageSize,
                query.CategoryId,
                query.MinPrice,
                query.MaxPrice,
                isActive,
                ParseSortBy(query.SortBy),
                ParseSortDirection(query.SortDirection)),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProductDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var includeInactive = User.IsInRole("Admin");

        var product = await sender.Send(
            new GetProductByIdQuery(id, includeInactive),
            cancellationToken);

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ProductDetailResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateProductCommand(
                request.CategoryId,
                request.Name,
                request.Slug,
                request.Sku,
                request.ShortDescription,
                request.LongDescription,
                request.Price,
                request.PromotionalPrice,
                request.StockQuantity,
                MapImages(request.Images)),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Value!.Id, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1.0" },
            result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ProductDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateProductCommand(
                id,
                request.CategoryId,
                request.Name,
                request.Slug,
                request.Sku,
                request.ShortDescription,
                request.LongDescription,
                request.Price,
                request.PromotionalPrice,
                request.StockQuantity,
                MapImages(request.Images)),
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(ProductDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetStatus(
        Guid id,
        [FromBody] SetProductStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new SetProductStatusCommand(id, request.IsActive),
            cancellationToken);

        return this.ToActionResult(result);
    }

    private bool? ResolveIsActiveFilter(bool? requestedIsActive)
    {
        if (User.IsInRole("Admin"))
        {
            return requestedIsActive;
        }

        return true;
    }

    private static ProductSortBy ParseSortBy(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "name" => ProductSortBy.Name,
            "price" => ProductSortBy.Price,
            _ => ProductSortBy.CreatedAt
        };

    private static SortDirection ParseSortDirection(string? value) =>
        value?.Trim().ToLowerInvariant() == "asc"
            ? SortDirection.Asc
            : SortDirection.Desc;

    private static IReadOnlyList<ProductImageInput> MapImages(IReadOnlyList<ProductImageRequest>? images) =>
        images?.Select(i => new ProductImageInput(i.Url, i.AltText, i.DisplayOrder, i.IsPrimary)).ToList()
        ?? [];
}
