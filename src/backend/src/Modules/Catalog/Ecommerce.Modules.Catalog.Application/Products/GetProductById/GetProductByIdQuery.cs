using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Products.GetProductById;

public sealed record GetProductByIdQuery(Guid ProductId, bool IncludeInactive) : IQuery<ProductDetailResponse>;

public sealed class GetProductByIdQueryValidator : AbstractValidator<GetProductByIdQuery>
{
    public GetProductByIdQueryValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public sealed class GetProductByIdQueryHandler(ICatalogDbContext dbContext)
    : IRequestHandler<GetProductByIdQuery, ProductDetailResponse>
{
    public async Task<ProductDetailResponse> Handle(
        GetProductByIdQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.Id == request.ProductId);

        if (!request.IncludeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        var product = await query.FirstOrDefaultAsync(cancellationToken);

        if (product is null)
        {
            throw new BusinessException("Catalog.ProductNotFound", "Produto não encontrado.", 404);
        }

        return CatalogMapper.ToDetail(product);
    }
}
