---
name: typescript
description: >
  Patrones de TypeScript: const types, flat interfaces, utility types.
  Trigger: Cuando se escriben tipos, interfaces, generics o se trabaja con TypeScript avanzado.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Escribiendo tipos/interfaces TypeScript"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## When to Use

Usa esta skill cuando:
- Creas o modificas tipos/interfaces
- Usas generics avanzados
- Necesitas utility types
- Trabajas con type inference

---

## Critical Patterns

### 1. Flat Interfaces

Preferir interfaces planas en lugar de anidadas:

```typescript
// ❌ MAL - Anidado
interface User {
  profile: {
    name: string;
    email: string;
  };
}

// ✅ BIEN - Plano
interface User {
  profileName: string;
  profileEmail: string;
}
```

### 2. Const Types

Usar `as const` para type inference:

```typescript
const ROLES = ['admin', 'user', 'guest'] as const
type Role = typeof ROLES[number] // 'admin' | 'user' | 'guest'
```

### 3. Utility Types Comunes

```typescript
// Partial - Todas las propiedades opcionales
type PartialUser = Partial<User>

// Pick - Seleccionar propiedades
type UserName = Pick<User, 'name' | 'email'>

// Omit - Omitir propiedades
type UserWithoutId = Omit<User, 'id'>

// Record - Objeto con keys dinámicas
type UserMap = Record<string, User>
```

---

## Resources

- **TypeScript Docs**: https://www.typescriptlang.org/docs/
