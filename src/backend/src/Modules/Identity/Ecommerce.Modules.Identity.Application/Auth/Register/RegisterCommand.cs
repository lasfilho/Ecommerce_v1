using Ecommerce.Modules.Identity.Application.Abstractions;
using Ecommerce.Modules.Identity.Application.Models;
using Ecommerce.Modules.Identity.Application.Services;
using Ecommerce.Modules.Identity.Domain.Constants;
using Ecommerce.Modules.Identity.Domain.Entities;
using Ecommerce.Shared.Application;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Application.Auth.Register;

public sealed record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? IpAddress) : ICommand<AuthTokensResponse>;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
    }
}

public sealed class RegisterCommandHandler(
    IIdentityDbContext dbContext,
    IPasswordHasher passwordHasher,
    AuthTokenIssuer authTokenIssuer)
    : IRequestHandler<RegisterCommand, Result<AuthTokensResponse>>
{
    public async Task<Result<AuthTokensResponse>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await dbContext.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken))
        {
            return Result.Failure<AuthTokensResponse>(
                Error.Conflict("Auth.EmailExists", "Este e-mail já está cadastrado."));
        }

        var customerRole = await dbContext.Roles
            .FirstOrDefaultAsync(r => r.NormalizedName == RoleNames.Customer.ToUpperInvariant(), cancellationToken);

        if (customerRole is null)
        {
            return Result.Failure<AuthTokensResponse>(
                Error.Failure("Auth.RoleMissing", "Role Customer não configurada no sistema."));
        }

        var user = new User(
            Guid.NewGuid(),
            normalizedEmail,
            passwordHasher.Hash(request.Password),
            request.FirstName.Trim(),
            request.LastName.Trim(),
            DateTime.UtcNow);

        dbContext.Users.Add(user);
        dbContext.UserRoles.Add(new UserRole(user.Id, customerRole.Id));
        await dbContext.SaveChangesAsync(cancellationToken);

        var tokens = await authTokenIssuer.IssueAsync(
            user,
            [RoleNames.Customer],
            request.IpAddress,
            cancellationToken);

        return Result.Success(tokens);
    }
}
