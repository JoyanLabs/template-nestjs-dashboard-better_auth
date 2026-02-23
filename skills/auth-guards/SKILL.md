---
name: auth-guards
description: >
  Guards y permisos avanzados con Better Auth y NestJS.
  Trigger: Cuando se protegen endpoints con guards, se verifican permisos granulares,
  o se implementa autorización basada en roles.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Protegiendo endpoints con guards avanzados|Verificar permisos granulares"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## When to Use

Usa esta skill cuando:
- Implementas protección de endpoints basada en roles
- Necesitas verificación de permisos granulares (ej: "puede editar usuarios")
- Creas guards personalizados
- Implementas middleware de autorización

---

## Arquitectura

```
Controller
    └── @UseGuards(RolesGuard)
            └── @RequireRole('admin')
                    └── @RequirePermission({ user: ['create'] })
```

---

## Critical Patterns

### 1. RolesGuard - Verificación de Rol

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const session = await auth.api.getSession({
      headers: toWebHeaders(request.headers),
    });

    if (!session) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const requiredRoles = Reflect.getMetadata(ROLES_KEY, context.getHandler());
    const userRole = session.user.role || 'user';
    
    return requiredRoles.includes(userRole);
  }
}
```

### 2. PermissionsGuard - Verificación de Permisos

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = Reflect.getMetadata(PERMISSIONS_KEY, context.getHandler());
    
    // Usar checkRolePermission de Better Auth
    return authClient.admin.checkRolePermission({
      role: user.role,
      permissions: required,
    });
  }
}
```

### 3. Decoradores

```typescript
// Decorador de rol
export const RequireRole = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

// Decorador de permisos
export const RequirePermission = (permissions: PermissionRequirement) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### 4. Uso en Controladores

```typescript
@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  @Post()
  @RequireRole('admin')
  @RequirePermission({ user: ['create'] })
  async create(@Body() dto: CreateUserDto) {
    // Solo admin con permiso 'user:create' puede ejecutar
  }
}
```

---

## Decision Tree

```
¿Qué tipo de protección necesitas?
├── Solo autenticación?        → AuthController ya maneja esto
├── Rol específico?            → @RequireRole('admin') + RolesGuard
├── Permisos granulares?       → @RequirePermission({...}) + PermissionsGuard
└── Múltiples condiciones?     → Crear guard personalizado
```

---

## Resources

- **Ubicación**: `src/shared/infrastructure/guards/`
- **Better Auth**: Ver skill `better-auth`
