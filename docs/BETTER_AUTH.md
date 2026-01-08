# Guía de Integración Better Auth

Esta guía documenta cómo integrar Better Auth en SPP, incluyendo patrones de protección de rutas para backend y frontend.

## 📋 Resumen

| Tipo de Endpoint | Patrón | Ejemplo |
|-----------------|--------|---------| 
| **Autenticación** | `auth.api.*` con cookies | `AuthController` |
| **Admin (solo admin)** | `@RequireRole('admin')` | createUser, deleteUser |
| **Admin (granular)** | `@RequirePermission({...})` | listUsers, banUser |

---

## 🏗️ Arquitectura

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

## 🔒 Protección de Rutas (Backend)

### Opción A: Por Rol (Simple)

```typescript
import { RequireRole } from '@/shared/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '@/shared/infrastructure/guards/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  
  @Post()
  @RequireRole('admin')  // Solo admin
  async createUser() { ... }
}
```

### Opción B: Por Permisos (Granular)

```typescript
import { RequirePermission } from '@/shared/infrastructure/decorators/permission.decorator';
import { PermissionsGuard } from '@/shared/infrastructure/guards/permissions.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  
  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission({ user: ['list'] })  // Admin y Moderator
  async listUsers() { ... }
  
  @Post(':id/ban')
  @UseGuards(PermissionsGuard)
  @RequirePermission({ user: ['ban'] })   // Admin y Moderator
  async banUser() { ... }
}
```

### Cuándo usar cada uno

| Decorador | Cuándo usar | Ejemplo |
|-----------|-------------|---------|
| `@RequireRole('admin')` | Acciones exclusivas de admin | createUser, deleteUser, setRole |
| `@RequirePermission({...})` | Acciones compartidas entre roles | listUsers, banUser |

---

## 🔒 Protección de Rutas (Frontend)

### Middleware Basado en Permisos

```typescript
// middleware/user-management.ts
export default defineNuxtRouteMiddleware(async () => {
  const { checkPermission, isAdmin } = useRole()

  if (isAdmin.value) return  // Admin siempre tiene acceso
  
  if (!checkPermission({ user: ['list'] })) {
    return navigateTo({ path: '/', query: { error: 'unauthorized' } })
  }
})
```

### Uso en Páginas

```vue
<script setup>
definePageMeta({
  middleware: 'user-management'  // Permite admin y moderator
})
</script>
```

### Navegación Dinámica

```typescript
const { checkPermission } = useRole()

const navItems = computed(() => {
  const items = [{ label: 'General', to: '/settings' }]
  
  if (checkPermission({ user: ['list'] })) {
    items.push({ label: 'Users', to: '/settings/users' })
  }
  
  return items
})
```

### Verificación en Composables

```typescript
// En useUsersMutations
const { isAdmin, checkPermission } = useRole()

const banUser = async (userId: string) => {
  // Permiso granular
  if (!checkPermission({ user: ['ban'] })) {
    throw new Error('No autorizado')
  }
  await $fetch(`/api/users/${userId}/ban`, { method: 'POST' })
}

const deleteUser = async (userId: string) => {
  // Solo admin
  if (!isAdmin.value) {
    throw new Error('No autorizado')
  }
  await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
}
```

---

## 🎭 Roles y Permisos

### Definición (Backend)

```typescript
// src/shared/infrastructure/auth/permissions.ts
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

export const ac = createAccessControl(defaultStatements);

export const admin = ac.newRole({ ...adminAc.statements });
export const moderator = ac.newRole({
  user: ['list', 'ban'],
  session: ['list'],
});
export const user = ac.newRole({ session: [] });

export const roles = { admin, moderator, user };
```

### Permisos por Rol

| Rol | user:list | user:ban | user:create | user:delete | user:set-role |
|-----|-----------|----------|-------------|-------------|---------------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| moderator | ✅ | ✅ | ❌ | ❌ | ❌ |
| user | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🧭 useRole Composable (Frontend)

```typescript
const {
  // Verificación de roles
  hasRole,           // hasRole('admin') o hasRole(['admin', 'moderator'])
  isAdmin,           // computed: hasRole('admin')
  isModerator,       // computed: hasRole('moderator')
  currentRole,       // computed: rol actual del usuario
  
  // Verificación de permisos
  checkPermission,   // Síncrono: checkPermission({ user: ['ban'] })
  hasPermission,     // Async: await hasPermission({ user: ['delete'] })
  
  // Estado
  isBanned           // computed: usuario baneado
} = useRole()
```

---

## 📚 Endpoints de API

### Usuarios

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/users` | `user:list` | Listar usuarios |
| POST | `/api/users` | admin | Crear usuario |
| DELETE | `/api/users/:id` | admin | Eliminar usuario |
| POST | `/api/users/:id/ban` | `user:ban` | Banear usuario |
| DELETE | `/api/users/:id/ban` | `user:ban` | Desbanear usuario |

### Roles

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| PUT | `/api/roles/:userId` | admin | Cambiar rol |

---

*Última actualización: Enero 2026*
