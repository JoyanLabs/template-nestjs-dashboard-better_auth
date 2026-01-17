# 🐳 Docker Quick Start

Referencia rápida para trabajar con Docker en este proyecto.

---

## 📋 Archivos de Docker Compose

```
📂 proyecto/
├── docker-compose.yml       → 🔧 DESARROLLO
└── docker-compose.prod.yml  → 🚀 PRODUCCIÓN
```

---

## 🔧 Desarrollo

```bash
# ⬆️ Levantar
docker compose up

# ⬆️ Levantar en background
docker compose up -d

# 📋 Ver logs
docker compose logs -f app

# ⬇️ Detener
docker compose down

# 🔄 Reconstruir
docker compose up --build
```

**URLs:**
- API: http://localhost:3001/api
- Docs: http://localhost:3001/reference
- Health: http://localhost:3001/api/health
- Debug: puerto 9229

**Contenedores:**
- `app-dev` - Aplicación
- `app_postgres` - Base de datos

---

## 🚀 Producción

```bash
# ⬆️ Levantar
docker compose -f docker-compose.prod.yml up

# ⬆️ Levantar en background
docker compose -f docker-compose.prod.yml up -d

# 📋 Ver logs
docker compose -f docker-compose.prod.yml logs -f app

# ⬇️ Detener
docker compose -f docker-compose.prod.yml down

# 🔄 Reconstruir
docker compose -f docker-compose.prod.yml up --build
```

**URLs:**
- API: http://localhost:3001/api
- Docs: http://localhost:3001/reference
- Health: http://localhost:3001/api/health

**Contenedores:**
- `app-production` - Aplicación
- `app_postgres_prod` - Base de datos

---

## 🆘 Comandos Útiles

### Ver estado
```bash
docker compose ps
docker compose -f docker-compose.prod.yml ps
```

### Ejecutar comandos dentro del contenedor
```bash
# Desarrollo
docker compose exec app sh
docker compose exec app npx prisma migrate status

# Producción
docker compose -f docker-compose.prod.yml exec app sh
docker compose -f docker-compose.prod.yml exec app npx prisma migrate status
```

### Limpiar todo
```bash
# Desarrollo
docker compose down -v

# Producción
docker compose -f docker-compose.prod.yml down -v
```

---

## 📚 Más Información

- [📖 Guía Completa de Despliegue](docs/DOCKER_DEPLOYMENT.md)
- [🏗️ Docker Best Practices](docs/DOCKER_BEST_PRACTICES.md)
- [🔄 Prisma Workflow](docs/PRISMA_WORKFLOW.md)
