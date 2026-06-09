using System.Security.Cryptography;

namespace Ecommerce.Modules.Identity.Infrastructure.Security;

/// <summary>Gera refresh tokens criptograficamente seguros e armazena apenas o hash SHA-256.</summary>
internal sealed class RefreshTokenGeneratorService : Application.Abstractions.IRefreshTokenGenerator
{
    public string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public string HashToken(string token)
    {
        var hash = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash);
    }
}
