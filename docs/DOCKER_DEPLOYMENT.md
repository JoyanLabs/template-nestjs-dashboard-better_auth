# Guía de Despliegue con Docker

Este proyecto utiliza archivos Docker Compose separados para desarrollo y producción.

## 📁 Archivos de Docker Compose

| Archivo | Propósito | Servicios |
|---------|-----------|-----------|
| `docker-compose.yml` | **Desarrollo** | `app` (dev), `postgres` |
| `docker-compose.prod.yml` | **Producción** | `app` (prod), `postgres` |

---

## 🔧 Desarrollo

### Levantar el entorno de desarrollo

```bash
# Opción 1: Forma corta (usa docker-compose.yml por defecto)
docker compose up

# Opción 2: Con rebuild
docker compose up --build

# Opción 3: En background
docker compose up -d

# Ver logs
docker compose logs -f app
```

### Características del ambiente de desarrollo:

- ✅ Hot reload activado (volumen montado en `./src`)
- ✅ Debugger disponible en puerto `9229`
- ✅ Migraciones aplicadas automáticamente con `prisma migrate deploy`
- ✅ Variables de entorno desde `.env`
- ✅ Contenedor: `app-dev`
- ✅ PostgreSQL: `app_postgres`

### Detener desarrollo:

```bash
docker compose down

# Con limpieza de volúmenes (⚠️ BORRA DATOS)
docker compose down -v
```

---

## 🚀 Producción

### Levantar el entorno de producción

```bash
# Opción 1: Con archivo específico
docker compose -f docker-compose.prod.yml up

# Opción 2: Con rebuild
docker compose -f docker-compose.prod.yml up --build

# Opción 3: En background (recomendado)
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f app
```

### Características del ambiente de producción:

- ✅ Imagen optimizada (multi-stage build)
- ✅ Usuario no privilegiado (`node`)
- ✅ dumb-init para manejo correcto de señales
- ✅ Restart automático (`unless-stopped`)
- ✅ Resource limits (CPU: 1 core, RAM: 512MB)
- ✅ Migraciones aplicadas automáticamente con `prisma migrate deploy`
- ✅ Variables de entorno desde `.env`
- ✅ Contenedor: `app-production`
- ✅ PostgreSQL: `app_postgres_prod`

### Detener producción:

```bash
docker compose -f docker-compose.prod.yml down

# Con limpieza de volúmenes (⚠️ BORRA DATOS)
docker compose -f docker-compose.prod.yml down -v
```

---

## 📊 Comparación de Ambientes

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| **Dockerfile target** | `dev` | `production` |
| **Hot reload** | ✅ Sí | ❌ No |
| **Debugger** | ✅ Puerto 9229 | ❌ No |
| **Optimización** | ❌ No | ✅ Sí (optimizado) |
| **Volumen src/** | ✅ Montado | ❌ Copiado |
| **Restart policy** | `unless-stopped` | `unless-stopped` |
| **Resource limits** | Sí | Sí |
| **Usuario** | root | node (no privilegiado) |
| **dumb-init** | ❌ No | ✅ Sí |

---

## 🗄️ Base de Datos

### Volúmenes de PostgreSQL:

- **Desarrollo**: `postgres_data`
- **Producción**: `postgres_data_prod`

Esto permite que ambos ambientes tengan bases de datos independientes.

### Conectarse a PostgreSQL:

```bash
# Desarrollo
docker compose exec postgres psql -U postgres -d app_db

# Producción
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d app_db
```

### Ver migraciones aplicadas:

```bash
# Desarrollo
docker compose exec app npx prisma migrate status

# Producción
docker compose -f docker-compose.prod.yml exec app npx prisma migrate status
```

---

## 🔍 Comandos Útiles

### Ver estado de contenedores:

```bash
# Todos los contenedores
docker ps -a

# Solo de este proyecto
docker compose ps
docker compose -f docker-compose.prod.yml ps
```

### Ejecutar comandos en contenedores:

```bash
# Desarrollo
docker compose exec app sh
docker compose exec app npx prisma studio

# Producción
docker compose -f docker-compose.prod.yml exec app sh
docker compose -f docker-compose.prod.yml exec app node --version
```

### Reconstruir solo un servicio:

```bash
# Desarrollo
docker compose up --build app

# Producción
docker compose -f docker-compose.prod.yml up --build app
```

### Ver logs de un servicio específico:

```bash
# Desarrollo
docker compose logs -f postgres
docker compose logs -f app

# Producción
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 🧹 Limpieza

### Limpiar todo (desarrollo):

```bash
docker compose down -v
docker image rm app-backend-app
```

### Limpiar todo (producción):

```bash
docker compose -f docker-compose.prod.yml down -v
docker image rm app-backend-app
```

### Limpiar cache de build:

```bash
docker builder prune -f
```

### Limpiar TODO (⚠️ PELIGROSO - afecta otros proyectos):

```bash
# Eliminar contenedores detenidos
docker container prune -f

# Eliminar imágenes sin usar
docker image prune -a -f

# Eliminar volúmenes sin usar
docker volume prune -f

# Eliminar todo (contenedores, redes, imágenes, cache)
docker system prune -a --volumes -f
```

---

## 🐛 Troubleshooting

### Problema: Puerto ocupado

```bash
# Ver qué proceso usa el puerto 3001
lsof -i :3001
netstat -tulpn | grep 3001

# O cambiar el puerto en .env
PORT=3002
```

### Problema: Migraciones no se aplican

```bash
# Ver estado de migraciones
docker compose exec app npx prisma migrate status

# Aplicar manualmente
docker compose exec app npx prisma migrate deploy

# Reset (⚠️ BORRA DATOS)
docker compose exec app npx prisma migrate reset
```

### Problema: Volúmenes corruptos

```bash
# Detener todo
docker compose down

# Eliminar volúmenes
docker volume rm app-backend_postgres_data
docker volume rm app-backend_postgres_data_prod

# Levantar de nuevo (recreará volúmenes)
docker compose up
```

### Problema: Imagen no actualiza

```bash
# Forzar rebuild sin cache
docker compose build --no-cache app
docker compose up app

# O para producción
docker compose -f docker-compose.prod.yml build --no-cache app
docker compose -f docker-compose.prod.yml up app
```

---

## 📝 Variables de Entorno Importantes

Asegúrate de tener estas variables en tu `.env`:

```bash
# Servidor
NODE_ENV=production  # o development
PORT=3001
API_PREFIX=api

# Base de Datos (IMPORTANTE: usar "postgres" como host en Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app_db?schema=public

# PostgreSQL (para docker-compose)
POSTGRES_DB=app_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Autenticación
BETTER_AUTH_SECRET=tu-secret-de-al-menos-32-caracteres-aqui
BETTER_AUTH_URL=http://localhost:3001
JWT_SECRET=tu-jwt-secret-de-al-menos-16-caracteres

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🎯 Flujo de Trabajo Recomendado

### Para Desarrollo:

```bash
# 1. Clonar repo
git clone <repo-url>
cd app-backend

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus valores

# 3. Levantar desarrollo
docker compose up

# 4. Acceder a la app
open http://localhost:3001/api/health
open http://localhost:3001/reference
```

### Para Producción:

```bash
# 1. Asegurar que .env tiene configuración de producción
# NODE_ENV=production
# DATABASE_URL con host "postgres"

# 2. Construir y levantar
docker compose -f docker-compose.prod.yml up --build -d

# 3. Ver logs
docker compose -f docker-compose.prod.yml logs -f

# 4. Verificar salud
curl http://localhost:3001/api/health

# 5. Ver documentación
open http://localhost:3001/reference
```

---

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma + Docker Guide](https://www.prisma.io/docs/guides/using-prisma-in-docker)
- [NestJS Docker Best Practices](https://docs.nestjs.com/recipes/prisma#deployment)
- Ver también: `docs/DOCKER_BEST_PRACTICES.md`
- Ver también: `docs/PRISMA_WORKFLOW.md`

---

**Última actualización**: Enero 2026
