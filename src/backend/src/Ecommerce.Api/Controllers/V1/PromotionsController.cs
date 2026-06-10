using Asp.Versioning;
using Ecommerce.Api.Contracts.Promotions;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Application.Promotions.CreatePromotion;
using Ecommerce.Modules.Catalog.Application.Promotions.GetPromotionBySlug;
using Ecommerce.Modules.Catalog.Application.Promotions.ListActivePromotionBanners;
using Ecommerce.Modules.Catalog.Application.Promotions.ListPromotionProducts;
using Ecommerce.Modules.Catalog.Application.Promotions.ListPromotions;
using Ecommerce.Modules.Catalog.Application.Promotions.SetPromotionStatus;
using Ecommerce.Modules.Catalog.Application.Promotions.UpdatePromotion;
using Ecommerce.Modules.Catalog.Application.Products.ListProducts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Promoções do carrossel e campanhas com produtos dinâmicos.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/promotions")]
public sealed class PromotionsController(ISender sender) : ControllerBase
{
    [HttpGet("banners")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<PromotionBannerResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListBanners(CancellationToken cancellationToken)
    {
        var banners = await sender.Send(new ListActivePromotionBannersQuery(), cancellationToken);
        return Ok(banners);
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(IReadOnlyList<PromotionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var promotions = await sender.Send(new ListPromotionsQuery(isActive), cancellationToken);
        return Ok(promotions);
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PromotionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var promotion = await sender.Send(new GetPromotionBySlugQuery(slug), cancellationToken);
        if (promotion is null)
        {
            return NotFound();
        }

        return Ok(promotion);
    }

    [HttpGet("{slug}/products")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<ProductListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListProducts(
        string slug,
        [FromQuery] ListPromotionProductsQueryParams query,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new ListPromotionProductsQuery(
                slug,
                query.Page,
                query.PageSize,
                ParseSortBy(query.SortBy),
                ParseSortDirection(query.SortDirection)),
            cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(PromotionResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreatePromotionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreatePromotionCommand(
                request.Slug,
                request.Tag,
                request.Title,
                request.Subtitle,
                request.Highlight,
                request.HighlightLabel,
                request.BackgroundClass,
                request.FilterType,
                request.CategoryId,
                request.MinPrice,
                request.Keywords,
                request.ProductIds,
                request.DisplayOrder,
                request.StartsAt,
                request.EndsAt),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }

        return CreatedAtAction(
            nameof(GetBySlug),
            new { slug = result.Value.Slug, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1.0" },
            result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(PromotionResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdatePromotionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdatePromotionCommand(
                id,
                request.Tag,
                request.Title,
                request.Subtitle,
                request.Highlight,
                request.HighlightLabel,
                request.BackgroundClass,
                request.FilterType,
                request.CategoryId,
                request.MinPrice,
                request.Keywords,
                request.ProductIds,
                request.DisplayOrder,
                request.StartsAt,
                request.EndsAt),
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(PromotionResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetStatus(
        Guid id,
        [FromBody] SetPromotionStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new SetPromotionStatusCommand(id, request.IsActive),
            cancellationToken);

        return this.ToActionResult(result);
    }

    private static ProductSortBy ParseSortBy(string value) =>
        value.ToLowerInvariant() switch
        {
            "name" => ProductSortBy.Name,
            "price" => ProductSortBy.Price,
            _ => ProductSortBy.CreatedAt
        };

    private static SortDirection ParseSortDirection(string value) =>
        value.ToLowerInvariant() == "asc" ? SortDirection.Asc : SortDirection.Desc;
}
