using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Products.SetProductStatus;

public sealed record SetProductStatusCommand(Guid ProductId, bool IsActive) : ICommand<ProductDetailResponse>;

public sealed class SetProductStatusCommandValidator : AbstractValidator<SetProductStatusCommand>
{
    public SetProductStatusCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public sealed class SetProductStatusCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<SetProductStatusCommand, Result<ProductDetailResponse>>
{
    public async Task<Result<ProductDetailResponse>> Handle(
        SetProductStatusCommand request,
        CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product is null)
        {
            return Result.Failure<ProductDetailResponse>(
                Error.NotFound("Catalog.ProductNotFound", "Produto não encontrado."));
        }

        product.SetActive(request.IsActive, DateTime.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == request.ProductId, cancellationToken);

        return Result.Success(CatalogMapper.ToDetail(updated));
    }
}
