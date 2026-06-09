# Docker — E-Commerce

Ambiente containerizado com backend ASP.NET Core, frontend Angular, PostgreSQL e pgAdmin opcional.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `src/backend/Dockerfile` | API — targets `development` e `production` |
| `src/frontend/Dockerfile` | Angular — targets `development` e `production` |
| `docker-compose.yml` | Base (postgres, api, frontend) |
| `docker-compose.override.yml` | Dev automático — hot reload |
| `docker-compose.prod.yml` | Produção — sem volumes de código |
| `.env.example` | Variáveis de ambiente |

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose v2)
- Portas livres: `4200`, `5080`, `5432` (e `5050` se usar pgAdmin)

## Configuração inicial

```powershell
# Na raiz do projeto
copy .env.example .env
# Ajuste senhas em produção!
```

## Desenvolvimento (hot reload)

O `docker-compose.override.yml` é carregado automaticamente.

```powershell
docker compose up --build
```

| Serviço | URL | Hot reload |
|---------|-----|------------|
| Frontend | http://localhost:4200 | `ng serve` + volume |
| API | http://localhost:5080 | `dotnet watch` + volume |
| Swagger | http://localhost:5080/swagger | — |
| PostgreSQL | localhost:5432 | volume `postgres_data` |

### Apenas banco (sem API/front)

```powershell
docker compose up postgres -d
```

### Com pgAdmin (opcional)

```powershell
docker compose --profile tools up -d
```

pgAdmin: http://localhost:5050

**Conectar ao Postgres no pgAdmin:**

- Host: `postgres`
- Port: `5432`
- Database: `ecommerce`
- Username / Password: conforme `.env`

## Produção (build otimizado)

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- Frontend servido por **Nginx** na porta `4200` (mapeada para 80 no container)
- API em modo `Production`
- Sem bind mounts — imagens imutáveis
- Nginx faz proxy de `/api/` → container `api:8080`

## Variáveis de ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `POSTGRES_DB` | ecommerce | Nome do banco |
| `POSTGRES_USER` | ecommerce | Usuário PostgreSQL |
| `POSTGRES_PASSWORD` | changeme | Senha (trocar em prod!) |
| `POSTGRES_PORT` | 5432 | Porta exposta |
| `API_PORT` | 5080 | Porta da API |
| `FRONTEND_PORT` | 4200 | Porta do frontend |
| `JWT_SECRET` | (dev) | Segredo JWT — obrigatório trocar em prod |
| `CORS_ORIGIN` | http://localhost:4200 | Origem permitida no CORS |

## Volumes

| Volume | Persistência |
|--------|----------------|
| `postgres_data` | Dados do PostgreSQL |
| `pgadmin_data` | Configurações pgAdmin |

## Comandos úteis

```powershell
# Parar tudo
docker compose down

# Parar e remover volumes (apaga banco!)
docker compose down -v

# Logs da API
docker compose logs -f api

# Rebuild só do backend
docker compose build api

# Shell no container da API
docker compose exec api sh
```

## Credenciais seed (dev)

```
Admin: admin@ecommerce.local / Admin@123
```

## Troubleshooting

**API não conecta ao banco:** aguarde o healthcheck do Postgres (`healthy`). A API só sobe após o banco estar pronto.

**Hot reload lento no Windows:** já habilitado `DOTNET_USE_POLLING_FILE_WATCHER` e `--poll` no Angular.

**Erro de CORS:** confira `CORS_ORIGIN` no `.env` — deve ser `http://localhost:4200` em dev.
