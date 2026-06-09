using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Shared.Application;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Auth.GetCurrentUser;

public sealed record GetCurrentUserQuery : IQuery<UserProfileResponse>;

public sealed class GetCurrentUserQueryHandler(
    ICurrentUserService currentUser,
    IIdentityDbContext dbContext)
    : IRequestHandler<GetCurrentUserQuery, UserProfileResponse>
{
    public async Task<UserProfileResponse> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || currentUser.UserId is null)
        {
            throw new BusinessException("Auth.Unauthorized", "Usuário não autenticado.", 401);
        }

        var user = await dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == currentUser.UserId, cancellationToken)
            ?? throw new BusinessException("Auth.UserNotFound", "Usuário não encontrado.", 404);

        if (!user.IsActive)
        {
            throw new BusinessException("Auth.UserInactive", "Usuário inativo.", 403);
        }

        return new UserProfileResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.UserRoles.Select(ur => ur.Role.Name).ToList());
    }
}
