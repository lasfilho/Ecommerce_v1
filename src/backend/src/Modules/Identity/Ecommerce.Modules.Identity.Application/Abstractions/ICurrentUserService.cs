namespace Ecommerce.Modules.Identity.Application.Abstractions;

/// <summary>Contexto do usuário autenticado na requisição atual.</summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    IReadOnlyCollection<string> Roles { get; }
}
