using Ecommerce.Modules.Identity.Application.Models;

namespace Ecommerce.Modules.Identity.Application.Abstractions;

/// <summary>Geração de access tokens JWT.</summary>
public interface IJwtTokenGenerator
{
    TokenPair GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles);
}
