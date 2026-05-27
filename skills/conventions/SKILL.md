---
name: conventions
description: >
  Convenciones de nomenclatura y patrones del proyecto template backend.
  Trigger: Cuando se crean nuevos archivos, modelos Prisma, entidades, o se necesita conocer las convenciones de naming.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Creando nuevos archivos, modelos, entidades, o preguntando por convenciones de naming"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Overview

Este skill documenta las convenciones de nomenclatura y patrones arquitectónicos usados en el template backend. Seguir estas convenciones asegura consistencia y facilita el mantenimiento.

---

## Prisma Naming Conventions

### Models

| Element | Convention | Example |
|---------|-----------|---------|
| **Model name** | PascalCase | `User`, `Client`, `EnvironmentalStudy` |
| **Field names** | camelCase | `firstName`, `createdAt`, `businessName` |
| **Table name** | snake_case via `@@map` | `@@map("users")`, `@@map("environmental_studies")` |
| **Foreign keys** | camelCase + `Id` suffix | `sectorId`, `studyId`, `uploadedById` |
| **Timestamps** | `createdAt`, `updatedAt` | Mapped to `created_at`, `updated_at` |

### Schema Example

```prisma
model EnvironmentalStudy {
  id          String   @id
  code        String   @unique
  name        String
  type        StudyType
  status      StudyStatus @default(ELABORATION)
  sectorId    String?  @map("sector_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  sector      Sector?  @relation(fields: [sectorId], references: [id])
  
  @@index([sectorId])
  @@index([status])
  @@map("environmental_studies")
}

model Client {
  id            String    @id
  businessName String
  taxId         String    @unique
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  contacts      Contact[]  
  environmentalStudies  EnvironmentalStudy[]
  
  @@map("clients")
}
```

### Naming Rules

1. **Modelos**: Nombre singular en PascalCase
2. **Tablas**: Nombre plural en snake_case con `@@map`
3. **Foreign Keys**: `{ReferencedModel}` + `Id` en camelCase
4. **Índices**: Agregar `@@index` para campos de búsqueda frecuente
5. **Enums**: PascalCase para valores

```prisma
enum StudyStatus {
  ELABORATION
  IN_REVIEW
  APPROVED
  REJECTED
}
```

---

## TypeScript/Node.js Conventions

### Package Manager

- **Package Manager**: pnpm >= 10.27.0
- **Node Version**: >= 24.x
- **Module Type**: ES Modules (`"type": "module"`)

### ES Module Imports

**CRITICAL**: Los imports locales requieren extensión `.js`:

| Tipo | Ejemplo | Requiere `.js` |
|------|---------|----------------|
| Path aliases (`@/`) | `from '@/shared/domain/entity.js'` | SI |
| Relativos (`./`, `../`) | `from '../commands/command.js'` | SI |
| NPM packages | `from '@nestjs/common'` | NO |

```typescript
// CORRECTO
import { Injectable } from '@nestjs/common';
import { BaseEntity } from '@/shared/domain/base.entity.js';
import { CreateUserCommand } from '../commands/create-user.command.js';

// INCORRECTO
import { Injectable } from '@nestjs/common.js'; // NO
import { BaseEntity } from '@/shared/domain/base.entity'; // NO
```

### File Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Repository Interface | `{name}.repository.interface.ts` | `user.repository.interface.ts` |
| Repository Impl | `prisma-{name}.repository.ts` | `prisma-user.repository.ts` |
| Mapper | `{name}.mapper.ts` | `user.mapper.ts` |
| Command | `{action}-{entity}.command.ts` | `create-user.command.ts` |
| Query | `{action}-{entity}.query.ts` | `get-user.query.ts` |
| Handler | `{action}-{entity}.handler.ts` | `create-user.handler.ts` |
| Controller | `{entity}.controller.ts` | `user.controller.ts` |
| DTO | `{entity}.dto.ts` | `user.dto.ts` |
| Module | `{context}.module.ts` | `user.module.ts` |

---

## NestJS Architecture Conventions

### Directory Structure

```
src/
├── app/                    # Configuración global NestJS
│   ├── app.module.ts
│   └── auth/               # Controlador de autenticación
├── contexts/               # Módulos de negocio (Bounded Contexts)
│   └── {context}/
│       ├── api/            # Controllers, DTOs
│       ├── application/    # Use Cases (CQRS)
│       │   ├── commands/   # Operaciones de escritura
│       │   ├── queries/    # Operaciones de lectura
│       │   └── ports/      # Interfaces (contratos)
│       ├── domain/         # Entidades, repositorios (interfaces)
│       └── infrastructure/ # Implementaciones
│           ├── adapters/   # Adaptadores de servicios externos
│           ├── persistence/
│           │   ├── mappers/
│           │   └── repositories/
│           └── {context}.module.ts
├── shared/                 # Código compartido
│   ├── domain/             # BaseEntity, IRepository
│   ├── infrastructure/     # PrismaService, Auth, Email
│   └── exceptions/         # Excepciones de dominio
└── types/                  # Tipos globales
```

### CQRS Pattern

- **Commands**: Operaciones de escritura (create, update, delete)
- **Queries**: Operaciones de lectura (get, list, search)

```typescript
// Command
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// Handler
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand) {
    // Implementation
  }
}
```

### Repository Pattern

```typescript
// Interface (domain/repositories/)
export interface IUserRepository extends IRepository<UserEntity, Prisma.UserWhereInput> {
  findByEmail(email: string, tx?: PrismaClientOrTransaction): Promise<UserEntity | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Implementation (infrastructure/persistence/repositories/)
@Injectable()
export class PrismaUserRepository extends PrismaBaseRepository<UserEntity, ...>
  implements IUserRepository {
  // Specific methods
}
```

---

## Git Conventions

### Commit Messages

**Formato**: `<type>[optional scope]: <description>`

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Máx 100 caracteres | `feat(users): add email validation` | `feat(users): add email validation for new users` |
| Sin mayúscula inicial | `fix(auth): handle token expiry` | `fix(auth): Handle token expiry` |
| Sin punto final | `docs(readme): update steps` | `docs(readme): update steps.` |

**Tipos permitidos**:
| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato (no afecta lógica) |
| `refactor` | Refactor sin cambio de comportamiento |
| `perf` | Mejora de performance |
| `test` | Tests |
| `chore` | Mantenimiento/config |

### Ejemplos

```bash
feat(auth): add password reset endpoint
fix(users): validate email format
refactor(api): extract validation logic
docs(readme): add deployment steps
chore(deps): update prisma to v7
test(users): add unit tests for service
```

---

## Testing Conventions

### Structure

```
tests/
├── unit/
│   └── contexts/{context}/
│       └── {use-case}.test.ts
├── e2e/
│   └── {endpoint}.test.ts
├── integration/
│   └── repositories/
│       └── prisma-{entity}.repository.test.ts
└── utils/
    ├── mock.ts
    ├── fixtures.ts
    └── test-db.ts
```

### Commands

```bash
pnpm test:unit              # Unit tests
pnpm test:e2e               # E2E tests
pnpm test -- --coverage     # Con coverage
```

---

## Common Pitfalls

### ES Module Imports

```typescript
// MAL - npm packages con .js
import { Injectable } from '@nestjs/common.js'; // ERROR

// MAL - falta .js en import local
import { BaseEntity } from '@/shared/domain/base.entity'; // ERROR

// BIEN
import { Injectable } from '@nestjs/common';
import { BaseEntity } from '@/shared/domain/base.entity.js';
```

### Prisma Foreign Keys

```prisma
// MAL - Foreign key sin convención
model Post {
  author    String
  authorRef User @relation(fields: [author], references: [id])
}

// BIEN - Foreign key con `Id` suffix
model Post {
  authorId String @map("author_id")
  author   User   @relation(fields: [authorId], references: [id])
  
  @@map("posts")
}
```

### Repository Interface Token

```typescript
// MAL - Token como string
provide: 'USER_REPOSITORY',
useClass: PrismaUserRepository,

// BIEN - Token como Symbol
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
// ...
provide: USER_REPOSITORY,
useClass: PrismaUserRepository,
```

---

## Quick Reference

### File Creation Checklist

| Paso | Archivo | Ubicación |
|------|---------|-----------|
| 1 | Prisma Model | `prisma/schema.prisma` |
| 2 | Domain Entity | `contexts/{ctx}/domain/entities/{name}.entity.ts` |
| 3 | Repository Interface | `contexts/{ctx}/domain/repositories/{name}.repository.interface.ts` |
| 4 | Mapper | `contexts/{ctx}/infrastructure/persistence/mappers/{name}.mapper.ts` |
| 5 | Repository Impl | `contexts/{ctx}/infrastructure/persistence/repositories/prisma-{name}.repository.ts` |
| 6 | Command | `contexts/{ctx}/application/commands/{action}-{name}/` |
| 7 | Query | `contexts/{ctx}/application/queries/{action}-{name}/` |
| 8 | Handler | `contexts/{ctx}/application/commands/{action}-{name}/{action}-{name}.handler.ts` |
| 9 | Controller | `contexts/{ctx}/api/{name}.controller.ts` |
| 10 | DTO | `contexts/{ctx}/api/{name}.dto.ts` |
| 11 | Module | `contexts/{ctx}/{context}.module.ts` |

### Commands

```bash
# Backend
pnpm dev                    # Start con hot reload
npx prisma migrate dev      # Crear migración
npx prisma generate         # Regenerar cliente
pnpm test:unit              # Unit tests
pnpm lint:fix               # Fix linting
```

---

## Resources

- **[nestjs/SKILL.md](../../skills/nestjs/SKILL.md)** - Arquitectura hexagonal, CQRS
- **[prisma/SKILL.md](../../skills/prisma/SKILL.md)** - Migraciones, mappers, transacciones
- **[template-backend/SKILL.md](../../skills/template-backend/SKILL.md)** - Overview del proyecto
- **[git-guidelines/SKILL.md](../../skills/git-guidelines/SKILL.md)** - Commits y PRs