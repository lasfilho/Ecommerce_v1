using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Modules.Identity.Infrastructure.Security;

/// <summary>Hash de senha via ASP.NET Core Identity PasswordHasher (PBKDF2).</summary>
internal sealed class PasswordHasherService : IPasswordHasher
{
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(string password) => _hasher.HashPassword(null!, password);

    public bool Verify(string password, string passwordHash)
    {
        var result = _hasher.VerifyHashedPassword(null!, passwordHash, password);
        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
