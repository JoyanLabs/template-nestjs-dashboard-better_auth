---
name: template-backend
description: >
  Overview del proyecto NestJS Dashboard Template y navegación de componentes.
  Trigger: Para preguntas generales sobre el backend, estructura, o cómo empezar.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Preguntas generales sobre el template backend"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 11.x | Framework backend |
| **TypeScript** | 5.x | Lenguaje |
| **Prisma** | 7.x | ORM y migraciones |
| **PostgreSQL** | 18.x | Base de datos |
| **Better Auth** | 1.4.x | Autenticación y autorización |
| **Inngest** | 3.x | Tareas asíncronas |
| **Zod** | 4.x | Validación de schemas |
| **Vitest** | 4.x | Testing |
| **Biome** | 2.x | Linting y formateo |

---

## Arquitectura

**Hexagonal Pragmática**:

```
src/
├── app/                    # Configuración global NestJS
│   ├── app.module.ts
│   └── auth/               # Controlador de autenticación
├── contexts/               # Módulos de negocio (Contextos delimitados)
│   └── {context}/
│       ├── api/            # Controllers, DTOs
│       ├── application/    # Use Cases (CQRS)
│       ├── domain/         # Entidades, Interfaces
│       └── infrastructure/ # Prisma, Adaptadores
├── shared/                 # Código compartido
│   ├── domain/             # BaseEntity, IRepository
│   ├── infrastructure/     # Auth, Prisma, Inngest
│   └── exceptions/         # Excepciones de dominio
└── types/                  # Tipos globales
```

---

## Skills Disponibles

| Skill | Cuándo Usar |
|-------|-------------|
| `nestjs` | Controladores, módulos, guards, DI |
| `better-auth` | Autenticación, sesiones, roles |
| `inngest` | Funciones asíncronas, eventos |
| `prisma` | Migraciones, queries, mappers |
| `git-guidelines` | Commits y PRs |
| `zod-4` | Schemas de validación |

---

## Comandos Principales

```bash
# Desarrollo
pnpm dev                    # Start con hot reload
pnpm build                  # Build de producción

# Base de datos
npx prisma migrate dev      # Crear migración
npx prisma generate         # Regenerar cliente
npx prisma studio           # GUI de datos

# Testing
pnpm test                   # Todos los tests
pnpm test:unit              # Solo unit tests
pnpm test:e2e               # Solo e2e tests

# Linting
pnpm lint                   # Check
pnpm lint:fix               # Fix automático
```

---

## Cómo Crear un Nuevo Contexto

1. **Crear estructura de carpetas**:
```bash
mkdir -p src/contexts/{context}/{api,application/use-cases,domain/{entities,repositories},infrastructure/persistence/{mappers,repositories}}
```

2. **Definir modelo en Prisma**:
```bash
npx prisma migrate dev --name add_{context}
```

3. **Crear entidad de dominio** (Ver skill `nestjs`)
4. **Crear interfaz de repositorio** (Ver skill `prisma`)
5. **Implementar repositorio con Prisma** (Ver skill `prisma`)
6. **Crear caso de uso** (Ver skill `nestjs`)
7. **Crear controlador** (Ver skill `nestjs`)
8. **Registrar módulo** (Ver skill `nestjs`)

---

## Flujo de Autenticación

```
1. Usuario envía credenciales → POST /api/auth/sign-in
2. AuthController llama → auth.api.signInEmail()
3. Better Auth verifica → Crea sesión
4. Cookies de sesión → Enviadas al cliente
5. Requests siguientes → RolesGuard verifica sesión
```

---

## Flujo de Tareas Asíncronas

```
1. Use Case envía evento → inngest.send({ name: 'event', data: {...} })
2. Inngest recibe evento → Ejecuta función registrada
3. Función ejecuta steps → step.run('action')
4. Reintentos automáticos → Si un step falla
```

---

## Variables de Entorno

Ver `.env.example` para todas las variables. Las principales:

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Better Auth
BETTER_AUTH_SECRET=tu-secret-seguro
BETTER_AUTH_URL=http://localhost:3000

# Inngest
INNGEST_DEV=1
INNGEST_BASE_URL=http://localhost:8288
```

---

## Documentación

### Guías Principales

| Documento | Contenido |
|-----------|-----------|
| [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) | Arquitectura hexagonal y patrones |
| [docs/BETTER_AUTH.md](../docs/BETTER_AUTH.md) | Integración de autenticación |
| [docs/PRISMA_WORKFLOW.md](../docs/PRISMA_WORKFLOW.md) | Flujo de trabajo con Prisma |
| [docs/SETUP.md](../docs/SETUP.md) | Configuración inicial |

---

## Context7 MCP

Para documentación actualizada de cualquier librería:

```bash
mcp context7 resolve-library-id --query "nestjs" --libraryName "nestjs"
mcp context7 query-docs --libraryId "/nestjs/docs.nestjs.com" --query "tu pregunta"
```

Ver skill `context7-docs` para IDs y queries frecuentes.
