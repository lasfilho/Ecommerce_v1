using Ecommerce.Modules.Catalog.Application.Abstractions;
using Ecommerce.Modules.Catalog.Application.Common;
using Ecommerce.Modules.Catalog.Application.Mapping;
using Ecommerce.Modules.Catalog.Application.Models;
using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application.Categories.CreateCategory;

public sealed record CreateCategoryCommand(
    string Name,
    string? Slug,
    string? Description,
    Guid? ParentCategoryId) : ICommand<CategoryResponse>;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
    }
}

public sealed class CreateCategoryCommandHandler(ICatalogDbContext dbContext)
    : IRequestHandler<CreateCategoryCommand, Result<CategoryResponse>>
{
    public async Task<Result<CategoryResponse>> Handle(
        CreateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? SlugNormalizer.Normalize(request.Name)
            : SlugNormalizer.Normalize(request.Slug);

        if (string.IsNullOrWhiteSpace(slug))
        {
            return Result.Failure<CategoryResponse>(
                Error.Validation("Catalog.InvalidSlug", "Não foi possível gerar um slug válido."));
        }

        if (await dbContext.Categories.AnyAsync(c => c.Slug == slug, cancellationToken))
        {
            return Result.Failure<CategoryResponse>(
                Error.Conflict("Catalog.CategorySlugExists", "Já existe uma categoria com este slug."));
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

        var category = new Category(
            Guid.NewGuid(),
            request.Name.Trim(),
            slug,
            string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            request.ParentCategoryId,
            DateTime.UtcNow);

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(CatalogMapper.ToResponse(category));
    }
}
