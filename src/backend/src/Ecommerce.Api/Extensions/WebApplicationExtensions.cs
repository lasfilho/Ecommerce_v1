using Ecommerce.Api.Middleware;

namespace Ecommerce.Api.Extensions;

/// <summary>Pipeline HTTP da API: middlewares e endpoints.</summary>
public static class WebApplicationExtensions
{
    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "E-commerce API v1");
            });
        }

        // Só redireciona para HTTPS quando a porta HTTPS está configurada (evita warning no perfil "http").
        var urls = app.Configuration["ASPNETCORE_URLS"]
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
            ?? string.Empty;

        if (urls.Contains("https", StringComparison.OrdinalIgnoreCase) || app.Environment.IsProduction())
        {
            app.UseHttpsRedirection();
        }

        app.UseCors("Frontend");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = _ => false
        });
        app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        });

        return app;
    }
}
