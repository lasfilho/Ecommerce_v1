using Asp.Versioning;
using Ecommerce.Api.Contracts.Auth;
using Ecommerce.Api.Extensions;
using Ecommerce.Modules.Identity.Application.Auth.GetCurrentUser;
using Ecommerce.Modules.Identity.Application.Auth.Login;
using Ecommerce.Modules.Identity.Application.Auth.RefreshToken;
using Ecommerce.Modules.Identity.Application.Auth.Register;
using Ecommerce.Modules.Identity.Application.Auth.RevokeToken;
using Ecommerce.Modules.Identity.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers.V1;

/// <summary>Autenticação e gerenciamento de tokens.</summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public sealed class AuthController(ISender sender) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new RegisterCommand(
                request.Email,
                request.Password,
                request.FirstName,
                request.LastName,
                HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken);

        return ToAuthResponse(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new LoginCommand(
                request.Email,
                request.Password,
                HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken);

        return ToAuthResponse(result);
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new RefreshTokenCommand(
                request.RefreshToken,
                HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken);

        return ToAuthResponse(result);
    }

    [HttpPost("revoke-token")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RevokeToken(
        [FromBody] RevokeTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new RevokeTokenCommand(
                request.RefreshToken,
                HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var profile = await sender.Send(new GetCurrentUserQuery(), cancellationToken);
        return Ok(profile);
    }

    private IActionResult ToAuthResponse(Shared.Application.Result<AuthTokensResponse> result)
    {
        if (result.IsFailure)
        {
            return this.ToActionResult(result);
        }

        return Ok(new AuthResponse(
            result.Value.AccessToken,
            result.Value.RefreshToken,
            result.Value.AccessTokenExpiresAt));
    }
}
