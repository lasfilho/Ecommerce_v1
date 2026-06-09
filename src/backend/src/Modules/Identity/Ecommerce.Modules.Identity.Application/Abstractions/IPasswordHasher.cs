namespace Ecommerce.Modules.Identity.Application.Abstractions;

/// <summary>Hash e verificação segura de senhas.</summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}
