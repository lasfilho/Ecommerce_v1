using Ecommerce.Shared.Application;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Extensions;

/// <summary>Converte Result da camada Application em respostas HTTP consistentes.</summary>
public static class ResultExtensions
{
    public static IActionResult ToActionResult(this ControllerBase controller, Result result)
    {
        if (result.IsSuccess)
        {
            return controller.NoContent();
        }

        return ToErrorResult(controller, result.Error);
    }

    public static IActionResult ToActionResult<T>(this ControllerBase controller, Result<T> result)
    {
        if (result.IsSuccess)
        {
            return controller.Ok(result.Value);
        }

        return ToErrorResult(controller, result.Error);
    }

    private static IActionResult ToErrorResult(ControllerBase controller, Error error) =>
        error.Code switch
        {
            var code when code.EndsWith("NotFound", StringComparison.Ordinal) =>
                controller.NotFound(new { code = error.Code, message = error.Message }),

            var code when code.StartsWith("Orders.Forbidden", StringComparison.Ordinal) =>
                controller.StatusCode(StatusCodes.Status403Forbidden, new { code = error.Code, message = error.Message }),

            var code when code.EndsWith("Exists", StringComparison.Ordinal) =>
                controller.Conflict(new { code = error.Code, message = error.Message }),

            var code when code.StartsWith("Auth.Invalid", StringComparison.Ordinal) ||
                          code.StartsWith("Validation", StringComparison.Ordinal) =>
                controller.BadRequest(new { code = error.Code, message = error.Message }),

            _ => controller.BadRequest(new { code = error.Code, message = error.Message })
        };
}
