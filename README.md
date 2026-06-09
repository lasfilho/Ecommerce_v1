# E-Commerce — monorepo full stack

Projeto de e-commerce com backend ASP.NET Core e frontend Angular.

## Estrutura

```
E_Commerce/
├── src/backend/      # API .NET 9 (modular monolith)
├── src/frontend/     # Angular 19
├── docker-compose.yml
├── docker-compose.override.yml   # dev (hot reload)
├── docker-compose.prod.yml       # produção
└── .env.example
```

## Início rápido com Docker (recomendado)

```powershell
copy .env.example .env
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API / Swagger | http://localhost:5080/swagger |
| PostgreSQL | localhost:5432 |

Documentação completa: [docs/DOCKER.md](docs/DOCKER.md)

## Desenvolvimento local (sem Docker)

```powershell
# PostgreSQL
docker compose up postgres -d

# API
cd src/backend
dotnet run --project src/Ecommerce.Api

# Frontend
cd src/frontend
npm install
npm start
```

Documentação do backend: [src/backend/README.md](src/backend/README.md)
