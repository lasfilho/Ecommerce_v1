using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Modules.Identity.Application.Options;
using Ecommerce.Modules.Identity.Domain.Entities;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Identity.Application.Services;

/// <summary>Emite e rotaciona tokens de autenticação.</summary>
public sealed class AuthTokenIssuer(
    IIdentityDbContext dbContext,
    IJwtTokenGenerator jwtTokenGenerator,
    IRefreshTokenGenerator refreshTokenGenerator,
    IOptions<JwtSettings> options)
{
    private readonly JwtSettings _settings = options.Value;

    public async Task<AuthTokensResponse> IssueAsync(
        User user,
        IEnumerable<string> roles,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        var refreshTokenPlain = refreshTokenGenerator.GenerateToken();
        var refreshTokenHash = refreshTokenGenerator.HashToken(refreshTokenPlain);

        var refreshToken = new RefreshToken(
            Guid.NewGuid(),
            user.Id,
            refreshTokenHash,
            DateTime.UtcNow.AddDays(_settings.RefreshTokenExpirationDays),
            DateTime.UtcNow,
            ipAddress);

        dbContext.RefreshTokens.Add(refreshToken);

        var access = jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, roles);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthTokensResponse(access.AccessToken, refreshTokenPlain, access.ExpiresAt);
    }

    public async Task<AuthTokensResponse> RotateAsync(
        RefreshToken storedToken,
        User user,
        IEnumerable<string> roles,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        var refreshTokenPlain = refreshTokenGenerator.GenerateToken();
        var refreshTokenHash = refreshTokenGenerator.HashToken(refreshTokenPlain);

        storedToken.Revoke(ipAddress, refreshTokenHash);

        dbContext.RefreshTokens.Add(new RefreshToken(
            Guid.NewGuid(),
            user.Id,
            refreshTokenHash,
            DateTime.UtcNow.AddDays(_settings.RefreshTokenExpirationDays),
            DateTime.UtcNow,
            ipAddress));

        var access = jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, roles);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthTokensResponse(access.AccessToken, refreshTokenPlain, access.ExpiresAt);
    }
}
