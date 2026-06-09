using System.Net;
using System.Text.Json;
using Ecommerce.Shared.Application;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Middleware;

/// <summary>Captura exceções não tratadas e retorna Problem Details padronizado.</summary>
public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, detail, extensions) = MapException(exception);

        if ((int)statusCode >= 500)
        {
            logger.LogError(exception, "Erro não tratado: {Message}", exception.Message);
        }
        else
        {
            logger.LogWarning(exception, "Erro de aplicação: {Message}", exception.Message);
        }

        var problem = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        foreach (var (key, value) in extensions)
        {
            problem.Extensions[key] = value;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }

    private static (HttpStatusCode Status, string Title, string Detail, Dictionary<string, object?> Extensions)
        MapException(Exception exception) =>
        exception switch
        {
            ValidationException validationException => (
                HttpStatusCode.BadRequest,
                "Erro de validação",
                "Um ou mais campos são inválidos.",
                new Dictionary<string, object?>
                {
                    ["code"] = "Validation.Error",
                    ["errors"] = validationException.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
                }),

            BusinessException businessException => (
                (HttpStatusCode)businessException.StatusCode,
                "Erro de negócio",
                businessException.Message,
                new Dictionary<string, object?> { ["code"] = businessException.Code }),

            _ => (
                HttpStatusCode.InternalServerError,
                "Erro interno",
                "Ocorreu um erro inesperado.",
                new Dictionary<string, object?> { ["code"] = "Server.Error" })
        };
}
