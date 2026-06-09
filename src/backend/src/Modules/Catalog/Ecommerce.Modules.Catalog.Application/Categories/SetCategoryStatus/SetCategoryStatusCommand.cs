using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Categories.SetCategoryStatus;

public sealed record SetCategoryStatusCommand(Guid CategoryId, bool IsActive) : ICommand<CategoryResponse>;

public sealed class SetCategoryStatusCommandValidator : AbstractValidator<SetCategoryStatusCommand>
{
    public SetCategoryStatusCommandValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}

public sealed class SetCategoryStatusCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<SetCategoryStatusCommand, Result<CategoryResponse>>
{
    public async Task<Result<CategoryResponse>> Handle(
        SetCategoryStatusCommand request,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (category is null)
        {
            return Result.Failure<CategoryResponse>(
                Error.NotFound("Catalog.CategoryNotFound", "Categoria não encontrada."));
        }

        category.SetActive(request.IsActive, DateTime.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(CatalogMapper.ToResponse(category));
    }
}
