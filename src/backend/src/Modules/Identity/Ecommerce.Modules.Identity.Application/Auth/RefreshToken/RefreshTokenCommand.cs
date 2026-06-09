using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Modules.Identity.Application.Services;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Auth.RefreshToken;

public sealed record RefreshTokenCommand(
    string RefreshToken,
    string? IpAddress) : ICommand<AuthTokensResponse>;

public sealed class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public sealed class RefreshTokenCommandHandler(
    IIdentityDbContext dbContext,
    IRefreshTokenGenerator refreshTokenGenerator,
    AuthTokenIssuer authTokenIssuer)
    : IRequestHandler<RefreshTokenCommand, Result<AuthTokensResponse>>
{
    public async Task<Result<AuthTokensResponse>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        var tokenHash = refreshTokenGenerator.HashToken(request.RefreshToken);

        var storedToken = await dbContext.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || !storedToken.IsActive)
        {
            return Result.Failure<AuthTokensResponse>(
                Error.Validation("Auth.InvalidRefreshToken", "Refresh token inválido ou expirado."));
        }

        if (!storedToken.User.IsActive)
        {
            return Result.Failure<AuthTokensResponse>(
                Error.Validation("Auth.UserInactive", "Usuário inativo."));
        }

        var roles = storedToken.User.UserRoles.Select(ur => ur.Role.Name).ToList();
        var tokens = await authTokenIssuer.RotateAsync(
            storedToken,
            storedToken.User,
            roles,
            request.IpAddress,
            cancellationToken);

        return Result.Success(tokens);
    }
}
