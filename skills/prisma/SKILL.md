---
name: prisma
description: >
  Patrones de Prisma ORM para migraciones, queries y mappers.
  Trigger: Cuando se trabaja con schema.prisma, migraciones, o queries de base de datos.
license: MIT
metadata:
  author: template-team
  version: "2.0"
  scope: [root]
  auto_invoke: "Trabajando con Prisma, repositorios, o base de datos"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Arquitectura

```
prisma/
├── schema.prisma          # Schema de la base de datos
└── migrations/            # Migraciones SQL

src/shared/infrastructure/prisma/
├── prisma.module.ts       # Módulo NestJS
├── prisma.service.ts      # Servicio con lifecycle hooks
└── prisma.utils.ts        # Utilidades (cleanPrismaData)
```

---

## Critical Patterns

### 1. Migraciones

```bash
# Crear migración (desarrollo)
npx prisma migrate dev --name {descripcion_de_cambio}

# Aplicar migraciones (producción)
npx prisma migrate deploy

# Generar cliente después de cambios
npx prisma generate
```

### 2. Mappers

SIEMPRE separar conversiones Prisma <-> Domain:

```typescript
// Prisma → Domain
export function userToDomain(raw: PrismaUser): UserEntity {
  return new UserEntity(
    raw.id,
    raw.email,
    raw.name,
    raw.createdAt,
    raw.updatedAt,
  );
}

// Domain → Prisma (Create)
export function userToPrismaCreate(entity: UserEntity): Prisma.UserCreateInput {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
  };
}

// Domain → Prisma (Update)
export function userToPrismaUpdate(entity: Partial<UserEntity>): Prisma.UserUpdateInput {
  return cleanPrismaData({
    email: entity.email,
    name: entity.name,
  });
}
```

### 3. cleanPrismaData Utility

Elimina campos `undefined` para evitar errores de Prisma:

```typescript
export function cleanPrismaData<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  ) as T;
}

// Uso
const updateData = cleanPrismaData({
  name: dto.name,      // "John" → incluido
  email: dto.email,    // undefined → excluido
});
// Resultado: { name: "John" }
```

### 4. Transacciones

```typescript
// Transacción simple (array de operaciones)
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { ... } }),
  prisma.auditLog.create({ data: { ... } }),
]);

// Transacción interactiva (para lógica compleja)
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id } });
  if (!user) throw new Error('Not found');
  
  await tx.user.update({
    where: { id },
    data: { balance: user.balance - amount },
  });
});
```

---

## Decision Tree

```
¿Qué operación necesitas?
├── Cambiar schema?               → Editar schema.prisma + migrate dev
├── Persistir datos (CRUD)?       → Usar Repository Pattern
├── Query simple?                 → prisma.model.findMany/findUnique
├── Query con relaciones?         → include: { relation: true }
├── Múltiples operaciones?        → $transaction([...])
└── Convertir datos?              → Usar mappers
```

---

## Commands

```bash
# Migraciones
npx prisma migrate dev --name {nombre}   # Crear migración
npx prisma migrate deploy                # Aplicar en prod
npx prisma migrate reset                 # Reset DB

# Cliente
npx prisma generate                      # Regenerar cliente
npx prisma studio                        # GUI para explorar datos

# Formateo
npx prisma format                        # Formatear schema.prisma
```

---

## Resources

- **Patrones**: Ver [assets/prisma-patterns.ts](assets/prisma-patterns.ts)
- **Documentación**: [docs/PRISMA_WORKFLOW.md](../../docs/PRISMA_WORKFLOW.md)
- **Workflow**: [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
