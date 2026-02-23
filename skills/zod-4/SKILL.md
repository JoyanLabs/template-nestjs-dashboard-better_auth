---
name: zod-4
description: >
  Patrones de validación con Zod 4.
  Trigger: Cuando se crean o actualizan schemas Zod v4 para validación/parsing (forms, payloads, DTOs).
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Creando schemas Zod"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## When to Use

Usa esta skill cuando:
- Creas o actualizas schemas de validación
- Validas datos de formularios
- Parseas/validas payloads de API
- Necesitas tipos inferidos de schemas (z.infer)

---

## Breaking Changes desde Zod 3

```typescript
// ❌ Zod 3 (VIEJO)
z.string().email()
z.string().uuid()
z.string().nonempty()

// ✅ Zod 4 (NUEVO)
z.email()
z.uuid()
z.string().min(1)
```

---

## Schemas Básicos

```typescript
import { z } from "zod"

// Primitivos
const stringSchema = z.string()
const emailSchema = z.email()
const uuidSchema = z.uuid()

// Con constraints
const nameSchema = z.string().min(1).max(100)
const ageSchema = z.number().int().positive()
```

---

## Object Schemas

```typescript
const userSchema = z.object({
  id: z.uuid(),
  email: z.email({ error: "Email inválido" }),
  name: z.string().min(1, { error: "Nombre requerido" }),
  age: z.number().int().positive().optional(),
})

type User = z.infer<typeof userSchema>

// Parsing
const user = userSchema.parse(data)
const result = userSchema.safeParse(data)
```

---

## Resources

- **Zod Docs**: https://zod.dev/
