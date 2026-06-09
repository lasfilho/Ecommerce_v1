namespace Ecommerce.Modules.Identity.Application.Abstractions;

/// <summary>Geração e hash de refresh tokens opacos.</summary>
public interface IRefreshTokenGenerator
{
    string GenerateToken();
    string HashToken(string token);
}
