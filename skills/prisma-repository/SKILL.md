---
name: prisma-repository
description: >
  Patrón repositorio con Prisma usando interfaces.
  Trigger: Cuando se implementan repositorios con Prisma, se crean interfaces
  de repositorio, o se mapean entidades de Prisma a dominio.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Implementando repositorios con Prisma"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## When to Use

Usa esta skill cuando:
- Creas un nuevo repositorio con Prisma
- Necesitas mapear entidades Prisma <-> Dominio
- Implementas la interfaz de repositorio
- Trabajas con transacciones

---

## Arquitectura

```
Domain Layer (Interface)
    ↓ implements
Infrastructure Layer (Prisma)
    ↓ uses
Prisma Client
```

---

## Critical Patterns

### 1. Interfaz de Repositorio (Domain)

```typescript
// domain/repositories/user.repository.interface.ts
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### 2. Implementación con Prisma

```typescript
// infrastructure/persistence/repositories/prisma-user.repository.ts
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? userToDomain(raw) : null;
  }

  async create(user: User): Promise<User> {
    const raw = await this.prisma.user.create({
      data: userToPrisma(user),
    });
    return userToDomain(raw);
  }
}
```

### 3. Mappers

```typescript
// infrastructure/persistence/mappers/user.mapper.ts
export function userToDomain(raw: PrismaUser): User {
  return new User(
    raw.id,
    raw.email,
    raw.name,
    raw.createdAt,
    raw.updatedAt,
  );
}

export function userToPrisma(user: User): Prisma.UserCreateInput {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
```

### 4. Registro en Módulo

```typescript
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
```

---

## Decision Tree

```
¿Dónde va cada archivo?
├── Interface del repositorio    → domain/repositories/
├── Implementación Prisma        → infrastructure/persistence/repositories/
├── Mapper                       → infrastructure/persistence/mappers/
└── Registro DI                  → Módulo correspondiente
```

---

## Resources

- **Skill**: `skills/prisma/SKILL.md`
- **Ejemplos**: Ver `skills/prisma/assets/`
