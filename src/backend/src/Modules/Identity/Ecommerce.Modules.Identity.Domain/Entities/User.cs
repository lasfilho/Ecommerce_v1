namespace Ecommerce.Modules.Identity.Domain.Entities;

/// <summary>Usuário do sistema — autenticação e perfil.</summary>
public sealed class User : Shared.Domain.AuditableEntity<Guid>
{
    private readonly List<UserRole> _userRoles = [];

    private User()
    {
    }

    public User(
        Guid id,
        string email,
        string passwordHash,
        string firstName,
        string lastName,
        DateTime createdAt)
        : base(id, createdAt)
    {
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        IsActive = true;
    }

    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public IReadOnlyCollection<UserRole> UserRoles => _userRoles.AsReadOnly();

    public void SetActive(bool isActive, DateTime updatedAt)
    {
        IsActive = isActive;
        MarkUpdated(updatedAt);
    }

    public void SetPasswordHash(string passwordHash, DateTime updatedAt)
    {
        PasswordHash = passwordHash;
        MarkUpdated(updatedAt);
    }
}
