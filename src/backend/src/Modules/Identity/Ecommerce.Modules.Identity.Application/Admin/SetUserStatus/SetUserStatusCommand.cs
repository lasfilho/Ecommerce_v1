using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Modules.Identity.Domain.Constants;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Admin.SetUserStatus;

public sealed record SetUserStatusCommand(Guid UserId, bool IsActive) : ICommand<AdminUserListItemResponse>;

public sealed class SetUserStatusCommandValidator : AbstractValidator<SetUserStatusCommand>
{
    public SetUserStatusCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public sealed class SetUserStatusCommandHandler(
    IIdentityDbContext dbContext,
    ICurrentUserService currentUser)
    : IRequestHandler<SetUserStatusCommand, Result<AdminUserListItemResponse>>
{
    public async Task<Result<AdminUserListItemResponse>> Handle(
        SetUserStatusCommand request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.Roles.Contains(RoleNames.Admin))
        {
            return Result.Failure<AdminUserListItemResponse>(
                Error.Failure("Auth.Forbidden", "Acesso restrito a administradores."));
        }

        if (currentUser.UserId == request.UserId && !request.IsActive)
        {
            return Result.Failure<AdminUserListItemResponse>(
                Error.Validation("Auth.CannotDeactivateSelf", "Você não pode desativar sua própria conta."));
        }

        var user = await dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user is null)
        {
            return Result.Failure<AdminUserListItemResponse>(
                Error.NotFound("Auth.UserNotFound", "Usuário não encontrado."));
        }

        user.SetActive(request.IsActive, DateTime.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(new AdminUserListItemResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.IsActive,
            user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            user.CreatedAt,
            user.UpdatedAt));
    }
}
