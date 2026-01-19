# Flujo de Trabajo con Prisma en Docker

Este documento explica cómo trabajar con Prisma en este proyecto, tanto en desarrollo como en producción.

## 📋 Resumen Rápido

| Ambiente | Comando | Dónde se ejecuta | Propósito |
|----------|---------|------------------|-----------|
| **Desarrollo Local** | `npx prisma migrate dev` | Tu máquina (host) | Crear y aplicar migraciones |
| **Docker Dev** | `npx prisma migrate deploy` | Contenedor | Solo aplicar migraciones existentes |
| **Docker Prod** | `npx prisma migrate deploy` | Contenedor | Solo aplicar migraciones existentes |

---

## 🔄 Flujo de Trabajo Recomendado

### 1️⃣ Desarrollo Local (Fuera de Docker)

Este es el flujo **recomendado** para crear migraciones:

```bash
# 1. Modifica tu schema.prisma
# Ejemplo: agregar un nuevo campo

# 2. Crea la migración
npx prisma migrate dev --name agregar_campo_email_verificado

# 3. Esto automáticamente:
#    ✅ Genera el cliente Prisma
#    ✅ Aplica la migración a tu BD local
#    ✅ Crea archivos en prisma/migrations/
```

### 2️⃣ Docker (Dev y Prod)

Cuando inicias los contenedores Docker:

```bash
# Los contenedores ejecutan automáticamente:
npx prisma migrate deploy

# Esto SOLO aplica migraciones que ya existen en prisma/migrations/
# NO crea nuevas migraciones
```

---

## 🐳 Comandos Docker

### Desarrollo con Docker Compose

```bash
# Levantar desarrollo
docker compose up app postgres

# Ver logs
docker compose logs -f app

# Ejecutar comando Prisma dentro del contenedor (si es necesario)
docker compose exec app npx prisma migrate status
docker compose exec app npx prisma studio
```

### Producción con Docker Compose

```bash
# Levantar producción
docker compose -f docker-compose.prod.yml up --build app postgres

# Ver logs
docker compose -f docker-compose.prod.yml logs -f app

# Verificar migraciones
docker compose -f docker-compose.prod.yml exec app npx prisma migrate status
```

---

## 🔧 Comandos Útiles de Prisma

### En tu máquina local (host):

```bash
# Crear una nueva migración
npx prisma migrate dev --name descripcion_cambio

# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Regenerar el cliente Prisma
npx prisma generate

# Resetear la BD (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Crear migración sin aplicar
npx prisma migrate dev --create-only
```

### Dentro del contenedor Docker:

```bash
# Aplicar migraciones pendientes
docker compose exec app npx prisma migrate deploy

# Ver estado
docker compose exec app npx prisma migrate status

# Abrir Prisma Studio
docker compose exec app npx prisma studio
```

---

## 🏗️ ¿Por qué este flujo?

### ✅ Ventajas del flujo actual:

1. **Control total**: Las migraciones se crean en tu máquina, no en contenedores efímeros
2. **Sin conflictos**: Todos los contenedores aplican las mismas migraciones
3. **Versionado**: Los archivos de migración se commitean al repositorio
4. **Producción segura**: `migrate deploy` nunca crea migraciones nuevas, solo aplica existentes

### ⚠️ Por qué NO usar `migrate dev` en Docker:

- `migrate dev` requiere input interactivo (nombre de la migración)
- Puede crear conflictos si múltiples contenedores lo ejecutan
- Las migraciones se perderían si el contenedor se destruye

### 📦 Prisma CLI en Producción

**IMPORTANTE**: El paquete `prisma` está en `dependencies` (no en `devDependencies`) porque:
- El comando `prisma migrate deploy` se ejecuta en producción
- Si estuviera en `devDependencies`, se eliminaría con `pnpm prune --prod`
- Esto causaría el error: `sh: prisma: not found`

El cliente `@prisma/client` y el CLI `prisma` son paquetes separados y ambos son necesarios en producción.

---

## 🚨 Troubleshooting

### Problema: "Migration failed to apply"

```bash
# Ver estado
npx prisma migrate status

# Si hay migraciones fallidas, puedes resolverlas manualmente
docker compose down -v  # Borra volúmenes
docker compose up postgres  # Levanta solo BD
npx prisma migrate deploy  # Aplica migraciones
```

### Problema: "Client is not compatible with schema"

```bash
# Regenerar el cliente
npx prisma generate

# O dentro del contenedor
docker compose exec app npx prisma generate
```

### Problema: "Connection refused" en contenedor

Verifica que `DATABASE_URL` use `postgres` como host (no `localhost`):

```env
# ✅ Correcto para Docker
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app_db

# ❌ Incorrecto para Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
```

---

## 📚 Referencias

- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma in Production](https://www.prisma.io/docs/guides/deployment/production)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🎯 Resumen Final

**Para desarrollo normal:**
1. Modifica `schema.prisma` en tu máquina
2. Ejecuta `npx prisma migrate dev --name nombre_descriptivo`
3. Los contenedores Docker aplicarán automáticamente las migraciones al iniciar

**Para producción:**
1. Las migraciones ya deben estar en `prisma/migrations/`
2. El contenedor ejecuta `migrate deploy` al iniciar
3. ✅ Todo funciona automáticamente
