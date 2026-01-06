# Protección de Rutas con Better Auth + NestJS

## ✅ Solución Implementada

Este proyecto usa **Better Auth 1.4.10** con **Express 5** y **NestJS 11**. La autenticación y autorización se maneja mediante:

1. **Handler directo en `main.ts`** - Para rutas de autenticación
2. **Guards personalizados** - Para protección por roles

---

## Arquitectura

### 1. Handler de Better Auth (main.ts)

**Ubicación**: [`main.ts`](file:///home/joshrm/Documentos/joyan/proyectos/spp/spp-backend/src/main.ts)

```typescript
// Fix para Express 5: Usar regex en lugar de wildcard
const express = app.getHttpAdapter().getInstance();
const authHandler = toNodeHandler(auth);
express.all(/^\/api\/auth\/.*$/, authHandler);
```

**Por qué regex**:
- Express 5 tiene un bug con el patrón `/*path`
- El regex `/^\/api\/auth\/.*$/` funciona correctamente
- Se monta ANTES del routing de NestJS

**Maneja**:
- ✅ Sign-up, Sign-in, Sign-out
- ✅ Get session
- ✅ Gestión de cookies
- ✅ Todos los endpoints de Better Auth Admin

---

### 2. Guards para Autorización

#### RolesGuard

**Ubicación**: [`roles.guard.ts`](file:///home/joshrm/Documentos/joyan/proyectos/spp/spp-backend/src/shared/infrastructure/guards/roles.guard.ts)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      throw new ForbiddenException('No autenticado');
    }

    const userRole = session.user.role || 'user';
    
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Requiere rol: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
```

#### Decorador @RequireRole

```typescript
export const RequireRole = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

## Uso en Controllers

### Rutas Públicas

```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

### Rutas Protegidas por Rol

```typescript
@Controller('auth/admin')
@UseGuards(RolesGuard)
@RequireRole('admin')
export class UserController {
  @Post('create-user')
  async createUser() {
    // Solo usuarios con rol 'admin'
  }
}
```

---

## Endpoints Disponibles

### Públicos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/sign-up/email` | POST | Registro |
| `/api/auth/sign-in/email` | POST | Login |
| `/api/auth/get-session` | GET | Obtener sesión |
| `/api/auth/sign-out` | POST | Logout |

### Admin (Requieren rol admin)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/admin/create-user` | POST | Crear usuario |
| `/api/auth/admin/ban-user` | POST | Banear usuario |
| `/api/auth/admin/unban-user` | POST | Desbanear usuario |
| `/api/auth/admin/list-users` | GET | Listar usuarios |
| `/api/auth/admin/remove-user` | DELETE | Eliminar usuario |
| `/api/auth/admin/set-role` | POST | Asignar rol |
| `/api/auth/admin/user-role` | GET | Obtener rol |

---

## Crear Usuario Admin

```sql
-- Conectar a PostgreSQL
psql $DATABASE_URL

-- Actualizar rol
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## Verificación

### 1. Health (Público)

```bash
curl http://localhost:3005/api/health
# Esperado: {"status":"ok"}
```

### 2. Sign Up (Público)

```bash
curl -X POST http://localhost:3005/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'
```

### 3. Admin sin Auth (Debe fallar)

```bash
curl http://localhost:3005/api/auth/admin/list-users
# Esperado: 403 Forbidden
```

### 4. Admin con Auth (Debe funcionar)

```bash
# Login
curl -X POST http://localhost:3005/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  -c cookies.txt

# Acceder
curl http://localhost:3005/api/auth/admin/list-users -b cookies.txt
# Esperado: 200 OK
```

---

## Referencias

- [Better Auth Docs](https://www.better-auth.com)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Express 5 Fix Issue](https://github.com/better-auth/better-auth/issues/6636)
