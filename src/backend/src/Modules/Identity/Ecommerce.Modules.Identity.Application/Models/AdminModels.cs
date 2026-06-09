namespace Ecommerce.Modules.Identity.Application.Models;

public sealed record AdminUserListItemResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    bool IsActive,
    IReadOnlyList<string> Roles,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record PagedUsersResponse(
    IReadOnlyList<AdminUserListItemResponse> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
