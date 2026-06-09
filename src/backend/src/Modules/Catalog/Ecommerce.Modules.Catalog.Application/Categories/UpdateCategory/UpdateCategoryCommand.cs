using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Common;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Categories.UpdateCategory;

public sealed record UpdateCategoryCommand(
    Guid CategoryId,
    string Name,
    string? Slug,
    string? Description,
    Guid? ParentCategoryId) : ICommand<CategoryResponse>;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
    }
}

public sealed class UpdateCategoryCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<UpdateCategoryCommand, Result<CategoryResponse>>
{
    public async Task<Result<CategoryResponse>> Handle(
        UpdateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (category is null)
        {
            return Result.Failure<CategoryResponse>(
                Error.NotFound("Catalog.CategoryNotFound", "Categoria não encontrada."));
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? SlugNormalizer.Normalize(request.Name)
            : SlugNormalizer.Normalize(request.Slug);

        if (string.IsNullOrWhiteSpace(slug))
        {
            return Result.Failure<CategoryResponse>(
                Error.Validation("Catalog.InvalidSlug", "Não foi possível gerar um slug válido."));
        }

        if (await dbContext.Categories.AnyAsync(
                c => c.Slug == slug && c.Id != request.CategoryId,
                cancellationToken))
        {
            return Result.Failure<CategoryResponse>(
                Error.Conflict("Catalog.CategorySlugExists", "Já existe uma categoria com este slug."));
        }

        if (request.ParentCategoryId == request.CategoryId)
        {
            return Result.Failure<CategoryResponse>(
                Error.Validation("Catalog.InvalidParent", "Uma categoria não pode ser pai de si mesma."));
        }

        if (request.ParentCategoryId.HasValue)
        {
            var parentExists = await dbContext.Categories
                .AnyAsync(c => c.Id == request.ParentCategoryId.Value, cancellationToken);

            if (!parentExists)
            {
                return Result.Failure<CategoryResponse>(
                    Error.NotFound("Catalog.ParentCategoryNotFound", "Categoria pai não encontrada."));
            }
        }

        category.Update(
            request.Name.Trim(),
            slug,
            string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            request.ParentCategoryId,
            DateTime.UtcNow);

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(CatalogMapper.ToResponse(category));
    }
}
