using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Auth.RevokeToken;

public sealed record RevokeTokenCommand(
    string RefreshToken,
    string? IpAddress) : ICommand;

public sealed class RevokeTokenCommandValidator : AbstractValidator<RevokeTokenCommand>
{
    public RevokeTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public sealed class RevokeTokenCommandHandler(
    IIdentityDbContext dbContext,
    IRefreshTokenGenerator refreshTokenGenerator)
    : IRequestHandler<RevokeTokenCommand, Result>
{
    public async Task<Result> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = refreshTokenGenerator.HashToken(request.RefreshToken);

        var storedToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || !storedToken.IsActive)
        {
            return Result.Success();
        }

        storedToken.Revoke(request.IpAddress);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
