namespace Ecommerce.Modules.Identity.Application.Models;

/// <summary>Par de tokens retornado nos fluxos de autenticação.</summary>
public sealed record AuthTokensResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt);

/// <summary>Access token JWT gerado internamente.</summary>
public sealed record TokenPair(string AccessToken, DateTime ExpiresAt);

/// <summary>Perfil público do usuário autenticado.</summary>
public sealed record UserProfileResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> Roles);
