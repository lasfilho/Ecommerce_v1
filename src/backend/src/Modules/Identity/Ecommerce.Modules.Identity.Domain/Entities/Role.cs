namespace Ecommerce.Modules.Identity.Domain.Entities;

/// <summary>Papel de autorização (Customer, Admin).</summary>
public sealed class Role : Shared.Domain.Entity<Guid>
{
    private Role()
    {
    }

    public Role(Guid id, string name, string normalizedName)
    {
        Id = id;
        Name = name;
        NormalizedName = normalizedName;
    }

    public string Name { get; private set; } = string.Empty;
    public string NormalizedName { get; private set; } = string.Empty;
}
