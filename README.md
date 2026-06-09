# E-Commerce — monorepo full stack

Projeto de e-commerce com backend ASP.NET Core e frontend Angular (em construção).

## Estrutura

```
E_Commerce/
├── src/backend/     # API .NET (modular monolith)
├── docker-compose.yml
└── .env.example
```

## Início rápido

```bash
# PostgreSQL
docker compose up -d

# API
cd src/backend
dotnet run --project src/Ecommerce.Api
```

Documentação detalhada do backend: [src/backend/README.md](src/backend/README.md)
