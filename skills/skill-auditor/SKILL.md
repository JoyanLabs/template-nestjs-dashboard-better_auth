---
name: skill-auditor
description: >
  Audita y revisa skills existentes para verificar calidad y consistencia.
  También proporciona patrones para auditoría de cambios en base de datos.
  Trigger: Cuando se necesita validar skills contra código real, verificar documentación de skills, o implementar auditoría de BD.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Auditar o revisar skills existentes|Validar skills contra código real|Verificar documentación de skills|Implementar auditoría de base de datos"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## When to Use

Usa esta skill cuando:
- Necesitas validar que un skill refleja correctamente el código real
- Quieres verificar la calidad de la documentación de skills
- Detectas inconsistencias entre skills y código
- Creas un nuevo skill y quieres asegurar calidad
- Necesitas implementar auditoría de cambios en entidades de base de datos
- Quieres rastrear quién modificó qué y cuándo en la BD

---

## Checklist de Auditoría de Skills

### Estructura del Skill

- [ ] Archivo `SKILL.md` existe en `skills/{name}/`
- [ ] Frontmatter completo con name, description, metadata
- [ ] `auto_invoke` definido y específico
- [ ] `allowed-tools` configurado

### Contenido

- [ ] Sección "When to Use" clara
- [ ] "When NOT to use" definido (si aplica)
- [ ] Ejemplos de código funcionales
- [ ] Decision tree (si aplica)
- [ ] Commands útiles listados
- [ ] Resources/Links actualizados

### Consistencia con Código

- [ ] Patrones documentados coinciden con código real
- [ ] Rutas de archivos son correctas
- [ ] APIs y funciones existen en el código
- [ ] No hay información obsoleta

---

## Auditoría de Base de Datos

### Implementación de Auditoría de Cambios

Esta skill también cubre la implementación de auditoría automática de cambios en la base de datos:

```
┌─────────────────────────────────────┐
│  Entidad Auditable                  │
│  - @Auditable() decorador           │
│  - Campos trackeados                │
└──────────────┬──────────────────────┘
               │ Eventos de BD
┌──────────────▼──────────────────────┐
│  AuditInterceptor/Listener          │
│  - Captura CREATE/UPDATE/DELETE     │
│  - Calcula diff de cambios          │
└──────────────┬──────────────────────┘
               │ Guarda
┌──────────────▼──────────────────────┐
│  Tabla de Auditoría                 │
│  - userId, timestamp                │
│  - operation (CREATE/UPDATE/DELETE) │
│  - entityName, entityId             │
│  - oldData, newData (JSON)          │
└─────────────────────────────────────┘
```

### 1. Decorador @Auditable()

```typescript
// shared/infrastructure/audit/auditable.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUDITABLE_KEY = 'AUDITABLE';
export const Auditable = () => SetMetadata(AUDITABLE_KEY, true);
```

### 2. Decorador @ExcludeFromAudit()

```typescript
// shared/infrastructure/audit/exclude-from-audit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const EXCLUDE_FROM_AUDIT_KEY = 'EXCLUDE_FROM_AUDIT';
export const ExcludeFromAudit = () => SetMetadata(EXCLUDE_FROM_AUDIT_KEY, true);
```

### 3. Servicio de Auditoría

```typescript
// shared/infrastructure/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuditEntry {
  userId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityName: string;
  entityId: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: entry.userId,
        operation: entry.operation,
        entityName: entry.entityName,
        entityId: entry.entityId,
        oldData: entry.oldData,
        newData: entry.newData,
        timestamp: entry.timestamp,
      },
    });
  }

  async getHistory(entityName: string, entityId: string): Promise<AuditEntry[]> {
    return this.prisma.auditLog.findMany({
      where: { entityName, entityId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
```

### 4. Interceptor de Auditoría

```typescript
// shared/infrastructure/audit/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service.js';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isAuditable = this.reflector.get<boolean>('AUDITABLE', context.getHandler());
    
    if (!isAuditable) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (result) => {
        // Lógica de auditoría aquí
        // Capturar cambios y llamar a auditService.log()
      }),
    );
  }
}
```

### 5. Uso en Controladores

```typescript
// contexts/users/api/users.controller.ts
import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '@/shared/infrastructure/audit/audit.interceptor.js';
import { Auditable } from '@/shared/infrastructure/audit/auditable.decorator.js';

@Controller('users')
@UseInterceptors(AuditInterceptor)
export class UsersController {
  
  @Post()
  @Auditable()
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Este método será auditado automáticamente
    return this.usersService.create(createUserDto);
  }
}
```

### 6. Schema Prisma para Auditoría

```prisma
// prisma/schema.prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String
  operation   String   // CREATE, UPDATE, DELETE
  entityName  String
  entityId    String
  oldData     Json?
  newData     Json?
  timestamp   DateTime @default(now())
  
  @@index([entityName, entityId])
  @@index([userId])
  @@index([timestamp])
}
```

---

## Comandos de Auditoría

```bash
# Verificar skills sin metadata
find skills/ -name "SKILL.md" -exec grep -L "auto_invoke" {} \;

# Buscar skills con fechas antiguas
grep -r "version:" skills/*/SKILL.md

# Verificar que todos los skills tienen assets/ o references/
for dir in skills/*/; do
  if [ ! -d "$dir/assets" ] && [ ! -d "$dir/references" ]; then
    echo "$dir - No tiene assets ni references"
  fi
done

# Buscar entidades sin decorador @Auditable()
grep -r "@Auditable" src/contexts/ --include="*.ts" -l

# Verificar que AuditLog está en schema.prisma
grep -A 10 "model AuditLog" prisma/schema.prisma
```

---

## Proceso de Auditoría de Skills

```
1. Seleccionar skill a auditar
   └─ Leer SKILL.md completamente

2. Verificar código real
   └─ Comparar patrones con implementación actual

3. Identificar inconsistencias
   └─ Listar diferencias encontradas

4. Crear plan de corrección
   └─ Priorizar actualizaciones necesarias

5. Actualizar skill
   └─ Editar SKILL.md con correcciones

6. Verificar
   └─ Re-leer skill actualizado
```

---

## Proceso de Auditoría de BD

```
1. Marcar entidades como @Auditable()
   └─ Agregar decorador a entidades relevantes

2. Implementar AuditService
   └─ Crear servicio con métodos log() y getHistory()

3. Crear AuditInterceptor
   └─ Capturar operaciones CREATE/UPDATE/DELETE

4. Configurar tabla AuditLog en Prisma
   └─ Agregar modelo al schema
   └─ Ejecutar migración

5. Aplicar interceptor global o por controller
   └─ @UseInterceptors(AuditInterceptor)

6. Verificar
   └─ Crear/modificar/eliminar registro
   └─ Verificar que se creó entrada en AuditLog
```

---

## Ejemplo de Reporte de Skill

```
Auditoría: better-auth
======================

✅ Estructura correcta
✅ Frontmatter completo
⚠️  Ejemplo de código desactualizado (usa método viejo)
❌ Falta documentar función resetPassword

Acciones recomendadas:
1. Actualizar ejemplo de signIn (línea 45)
2. Agregar sección "Password Reset"
3. Verificar que todas las funciones estén documentadas
```

---

## Ejemplo de Consulta de Historial

```typescript
// contexts/audit/api/audit.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from '@/shared/infrastructure/audit/audit.service.js';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get(':entity/:id')
  async getEntityHistory(
    @Param('entity') entityName: string,
    @Param('id') entityId: string,
    @Query('operation') operation?: 'CREATE' | 'UPDATE' | 'DELETE',
  ) {
    const history = await this.auditService.getHistory(entityName, entityId);
    
    if (operation) {
      return history.filter(entry => entry.operation === operation);
    }
    
    return history;
  }
}
```

---

## Decision Tree

```
¿Necesitas auditar?
│
├─ ¿Es un skill que necesita revisión?
│  ├─ SÍ: Seguir "Proceso de Auditoría de Skills"
│  │        → Revisar estructura del SKILL.md
│  │        → Verificar consistencia con código
│  │        → Actualizar si es necesario
│  │
│  └─ NO: Continuar
│
└─ ¿Es auditoría de base de datos?
   ├─ SÍ: Seguir "Proceso de Auditoría de BD"
   │        → Marcar entidades con @Auditable()
   │        → Implementar AuditService
   │        → Crear interceptor
   │        → Configurar tabla AuditLog
   │
   └─ NO: No aplica esta skill

¿Qué tipo de operación auditar?
├── CREATE  → Registrar newData completo
├── UPDATE  → Registrar diff (oldData vs newData)
└── DELETE  → Registrar oldData antes de eliminar
```

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Audits no se guardan | AuditLog no en schema | Agregar modelo Prisma y migrar |
| UserId es null | No hay auth en request | Verificar middleware de auth antes |
| Datos muy grandes | JSON excede límite | Excluir campos grandes con @ExcludeFromAudit() |
| Performance lento | Audits bloquean requests | Usar Inngest para auditoría async |

---

## Resources

### Documentación Relacionada
- **NestJS Interceptors**: https://docs.nestjs.com/interceptors
- **Prisma Middleware**: Para auditoría a nivel de Prisma Client
- **Reflection API**: Uso de Reflector para metadatos

### Skills Relacionados
- **nestjs** - Arquitectura y patrones NestJS
- **prisma** - ORM y manejo de BD
- **skill-creator** - Crear nuevos skills
- **skill-sync** - Sincronizar metadata
