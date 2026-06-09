# E-commerce Backend

Modular monolith em ASP.NET Core (.NET 9) com Clean Architecture, DDD leve e PostgreSQL.

## Projetos

| Projeto | Responsabilidade |
|---------|------------------|
| `Ecommerce.Api` | Host HTTP, controllers, middleware, pipeline |
| `Ecommerce.Shared` | Shared Kernel: Entity, Result, MediatR behaviors |
| `Ecommerce.Infrastructure` | DbContext, migrations, seed, interceptors |
| `Ecommerce.Modules.*.Domain` | Entidades e regras de domínio por módulo |
| `Ecommerce.Modules.*.Application` | Commands, queries e handlers (vertical slices) |
| `Ecommerce.Modules.*.Infrastructure` | Configurações EF Core (Fluent API) por módulo |

## Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (PostgreSQL local)

## Banco de dados (PostgreSQL)

### 1. Subir PostgreSQL

Na raiz do repositório (`E_Commerce/`):

```bash
docker compose up -d
```

### 2. Rodar a API (aplica migrations + seed automaticamente)

```bash
cd src/backend
dotnet run --project src/Ecommerce.Api
```

### 3. Migrations manuais (opcional)

```bash
cd src/backend
dotnet ef migrations add NomeDaMigration \
  --project src/Ecommerce.Infrastructure \
  --startup-project src/Ecommerce.Api \
  --output-dir Persistence/Migrations

dotnet ef database update \
  --project src/Ecommerce.Infrastructure \
  --startup-project src/Ecommerce.Api
```

### Seed inicial (dev)

| Dado | Valor |
|------|-------|
| Admin email | `admin@ecommerce.local` |
| Admin senha | `Admin@123` |
| Roles | Customer, Admin |
| Catálogo | 1 categoria + 1 produto exemplo |

## Como rodar

```bash
cd src/backend
dotnet restore
dotnet build
dotnet test
dotnet run --project src/Ecommerce.Api
```

## Qualidade

```bash
dotnet test tests/Ecommerce.UnitTests
dotnet format Ecommerce.sln --verify-no-changes
```

A API sobe em `http://localhost:5080` (perfil http).

## Endpoints úteis

| URL | Descrição |
|-----|-----------|
| `/swagger` | Documentação OpenAPI (Development) |
| `/health` | Health check geral |
| `/health/ready` | Health check do PostgreSQL |
| `/api/v1/status` | Status dos módulos |

## Schemas PostgreSQL

| Schema | Tabelas |
|--------|---------|
| `identity` | users, roles, user_roles |
| `catalog` | categories, products, product_images |
| `cart` | carts, cart_items |
| `orders` | orders, order_items |
