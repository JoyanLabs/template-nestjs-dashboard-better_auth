# Repository Guidelines - NestJS Dashboard Template

## Cómo Usar Esta Guía

- Empieza aquí para normas generales del proyecto.
- Cada skill tiene un archivo `SKILL.md` con patrones específicos.
- Para preguntas generales: `Read skills/template-backend/SKILL.md`

---

## Available Skills

Usa estos skills para patrones detallados bajo demanda:

### Skills Genéricos

| Skill | Descripción | URL |
|-------|-------------|-----|
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `zod-4` | API de Zod 4, validación de schemas | [SKILL.md](skills/zod-4/SKILL.md) |
| `context7-docs` | Consulta documentación actualizada via MCP | [SKILL.md](skills/context7-docs/SKILL.md) |

### Skills Específicos del Template

| Skill | Descripción | URL |
|-------|-------------|-----|
| `template-backend` | Overview del proyecto, navegación | [SKILL.md](skills/template-backend/SKILL.md) |
| `nestjs` | Arquitectura hexagonal, DI con tokens | [SKILL.md](skills/nestjs/SKILL.md) |
| `better-auth` | API programática, roles, permisos | [SKILL.md](skills/better-auth/SKILL.md) |
| `inngest` | Funciones asíncronas, steps, eventos | [SKILL.md](skills/inngest/SKILL.md) |
| `prisma` | Migraciones, mappers, transacciones | [SKILL.md](skills/prisma/SKILL.md) |
| `auth-guards` | Guards y permisos avanzados | [SKILL.md](skills/auth-guards/SKILL.md) |
| `prisma-repository` | Patrón repositorio con interfaces | [SKILL.md](skills/prisma-repository/SKILL.md) |
| `vitest-testing` | Patrones de testing con Vitest | [SKILL.md](skills/vitest-testing/SKILL.md) |
| `git-guidelines` | Commits, PRs con GitHub CLI | [SKILL.md](skills/git-guidelines/SKILL.md) |

### Meta Skills

| Skill | Descripción | URL |
|-------|-------------|-----|
| `skill-creator` | Crear nuevos AI agent skills | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Sincronizar metadata a AGENTS.md | [SKILL.md](skills/skill-sync/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Buscando documentación o buenas prácticas | `context7-docs` |
| Creando commits, PRs, o usando templates de GitHub | `git-guidelines` |
| Creando controladores, commands o queries NestJS | `nestjs` |
| Creando funciones Inngest o eventos | `inngest` |
| Creando nuevos skills | `skill-creator` |
| Creando schemas Zod | `zod-4` |
| Después de crear/modificar un skill | `skill-sync` |
| Escribiendo tipos/interfaces TypeScript | `typescript` |
| Preguntas generales sobre el template | `template-backend` |
| Regenerar tablas Auto-invoke de AGENTS.md | `skill-sync` |
| Trabajando con Prisma, repositorios, o base de datos | `prisma` |
| Trabajando con autenticación o permisos | `better-auth` |
| Protegiendo endpoints con guards avanzados | `auth-guards` |
| Implementando repositorios con Prisma | `prisma-repository` |
| Escribiendo tests con Vitest | `vitest-testing` |

---

## Project Overview

NestJS Dashboard Template es un backend moderno construido con NestJS, siguiendo arquitectura hexagonal.

| Componente | Tecnología |
|------------|------------|
| Framework | NestJS 11 |
| Lenguaje | TypeScript 5 |
| Base de Datos | PostgreSQL + Prisma 7 |
| Autenticación | Better Auth |
| Tareas Async | Inngest |
| Testing | Vitest |
| Linting | Biome |

---

## Estructura del Proyecto

```
src/
├── app/                    # Configuración global
├── contexts/               # Módulos de negocio
│   └── {context}/
│       ├── api/            # Controllers, DTOs
│       ├── application/    # Use Cases (CQRS)
│       ├── domain/         # Entidades, Interfaces
│       └── infrastructure/ # Prisma, Adaptadores
└── shared/                 # Código compartido
    ├── domain/             # BaseEntity, IRepository
    ├── infrastructure/     # Auth, Prisma, Inngest
    └── exceptions/         # Excepciones de dominio
```

---

## Development Commands

```bash
# Desarrollo
pnpm dev                    # Start con hot reload

# Base de datos
npx prisma migrate dev      # Crear migración
npx prisma generate         # Regenerar cliente

# Testing
pnpm test                   # Todos los tests
pnpm test:unit              # Unit tests
pnpm test:e2e               # E2E tests

# Linting
pnpm lint                   # Check
pnpm lint:fix               # Fix
```

---

## Commit & Pull Request Guidelines

Seguir estilo conventional-commit: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

**Examples:**
- `feat(users): add user creation endpoint`
- `fix(auth): handle expired session correctly`
- `docs(readme): update installation steps`
