using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Modules.Identity.Domain.Constants;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Admin.ListUsers;

public sealed record ListUsersQuery(int Page, int PageSize) : IQuery<PagedUsersResponse>;

public sealed class ListUsersQueryValidator : AbstractValidator<ListUsersQuery>
{
    public ListUsersQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}

public sealed class ListUsersQueryHandler(
    IIdentityDbContext dbContext,
    ICurrentUserService currentUser)
    : IRequestHandler<ListUsersQuery, PagedUsersResponse>
{
    public async Task<PagedUsersResponse> Handle(
        ListUsersQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.Roles.Contains(RoleNames.Admin))
        {
            throw new BusinessException("Auth.Forbidden", "Acesso restrito a administradores.", 403);
        }

        var query = dbContext.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .OrderByDescending(u => u.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var users = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = users
            .Select(u => new AdminUserListItemResponse(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.IsActive,
                u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                u.CreatedAt,
                u.UpdatedAt))
            .ToList();

        return new PagedUsersResponse(
            items,
            request.Page,
            request.PageSize,
            totalCount,
            totalPages);
    }
}
