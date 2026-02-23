---
name: better-auth
description: >
  Integración de Better Auth con NestJS usando API programática.
  Trigger: Cuando se trabaja con autenticación, sesiones, roles o permisos.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Trabajando con autenticación o permisos"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Arquitectura

```
src/shared/infrastructure/
├── auth/
│   ├── better-auth.config.ts    # Configuración con ac, roles
│   ├── better-auth.utils.ts     # Utilidades compartidas
│   └── permissions.ts           # Definición de roles y permisos
├── decorators/
│   ├── roles.decorator.ts       # @RequireRole
│   └── permission.decorator.ts  # @RequirePermission
└── guards/
    ├── roles.guard.ts           # Verifica rol string
    └── permissions.guard.ts     # Verifica permisos granulares
```

---

## Critical Patterns

### 1. API Programática (NO Middleware)

SIEMPRE usar `auth.api.*` directamente en controladores:

```typescript
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import { toWebHeaders, handleBetterAuthError } from '@/shared/infrastructure/auth/better-auth.utils.js';

@Post('sign-in')
async signIn(@Req() req: Request, @Res() res: Response, @Body() dto: SignInDto) {
  try {
    const result = await auth.api.signInEmail({
      headers: toWebHeaders(req.headers),
      body: { email: dto.email, password: dto.password },
      returnHeaders: true,
    });

    copyResponseHeaders(result.headers, res);
    return res.json(result.body);
  } catch (error) {
    handleBetterAuthError(error);
  }
}
```

### 2. Utilidades de Headers

```typescript
// toWebHeaders: Convierte headers de Express a Web Headers
const webHeaders = toWebHeaders(req.headers);

// copyResponseHeaders: Copia cookies de Better Auth a respuesta Express
copyResponseHeaders(betterAuthHeaders, res);

// handleBetterAuthError: Convierte APIError a HttpException
handleBetterAuthError(error);
```

### 3. Protección por Rol

```typescript
import { RequireRole } from '@/shared/infrastructure/decorators/roles.decorator.js';
import { RolesGuard } from '@/shared/infrastructure/guards/roles.guard.js';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  @Post()
  @RequireRole('admin')  // Solo admin
  async createUser(@Body() dto: CreateUserDto) { ... }
}
```

---

## Decision Tree

```
¿Qué tipo de protección necesitas?
├── Acción exclusiva de admin?      → @RequireRole('admin')
├── Acción compartida entre roles?  → @RequirePermission({ resource: ['action'] })
├── Sin restricción de rol?         → Solo @UseGuards(RolesGuard) para auth
└── Endpoint público?               → Sin guards
```

---

## Resources

- **Patrones**: Ver [assets/auth-patterns.ts](assets/auth-patterns.ts)
- **Documentación**: [docs/BETTER_AUTH.md](../../docs/BETTER_AUTH.md)
- **Config**: Ver `src/shared/infrastructure/auth/`
