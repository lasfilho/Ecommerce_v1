# syntax=docker/dockerfile:1

# ── Desenvolvimento: hot reload com dotnet watch ──────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS development
WORKDIR /src
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV DOTNET_WATCH_RESTART_ON_RUDE_EDIT=true
EXPOSE 8080
ENTRYPOINT ["dotnet", "watch", "run", "--project", "src/Ecommerce.Api/Ecommerce.Api.csproj", "--no-launch-profile", "--urls", "http://+:8080"]

# ── Build de produção ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "src/Ecommerce.Api/Ecommerce.Api.csproj"
RUN dotnet publish "src/Ecommerce.Api/Ecommerce.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ── Runtime de produção ───────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS production
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "Ecommerce.Api.dll"]
