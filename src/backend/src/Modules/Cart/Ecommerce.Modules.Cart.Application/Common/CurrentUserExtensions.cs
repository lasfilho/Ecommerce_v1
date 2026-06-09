using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Shared.Application;

namespace Ecommerce.Modules.Cart.Application.Common;

public static class CurrentUserExtensions
{
    public static Guid RequireUserId(this ICurrentUserService currentUser)
    {
        if (!currentUser.IsAuthenticated || currentUser.UserId is null)
        {
            throw new BusinessException("Auth.Unauthorized", "Usuário não autenticado.", 401);
        }

        return currentUser.UserId.Value;
    }
}
