---
name: inngest
description: >
  Patrones de funciones asíncronas con Inngest para tareas en background.
  Trigger: Cuando se crean funciones Inngest, se definen eventos, o se trabaja con steps.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Creando funciones Inngest o eventos"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Arquitectura

```
src/
├── shared/infrastructure/inngest-client/
│   ├── client.ts           # Instancia del SDK
│   ├── types.ts             # Definición de eventos
│   ├── functions-factory.ts # Registra todas las funciones
│   └── hello-world.fn.ts    # Función de ejemplo
│
└── contexts/{context}/infrastructure/inngest/
    └── *.fn.ts              # Funciones específicas del contexto
```

---

## Critical Patterns

### 1. Definir Eventos en types.ts

SIEMPRE definir eventos tipados:

```typescript
// shared/infrastructure/inngest-client/types.ts
export type Events = {
  'app/hello.world': {
    data: { message: string };
  };
  'user/created': {
    data: {
      userId: string;
      email: string;
      name: string;
    };
  };
};
```

### 2. Crear Funciones con Factory Pattern

SIEMPRE usar factory para inyectar dependencias:

```typescript
// contexts/users/infrastructure/inngest/user-onboarding.fn.ts
import { inngest } from '@/shared/infrastructure/inngest-client/client.js';

interface UserOnboardingDeps {
  logger: Logger;
  notificationService: INotificationService;
}

export const createUserOnboardingFn = ({ logger, notificationService }: UserOnboardingDeps) =>
  inngest.createFunction(
    { id: 'user-onboarding', retries: 3 },
    { event: 'user/created' },
    async ({ event, step }) => {
      const { userId, email, name } = event.data;

      // Step 1: Send email
      await step.run('send-welcome-email', async () => {
        return notificationService.sendEmail({
          to: email,
          subject: 'Welcome',
          html: welcomeTemplate({ name }),
        });
      });

      return { success: true, userId };
    },
  );
```

### 3. Registrar en functions-factory.ts

```typescript
// shared/infrastructure/inngest-client/functions-factory.ts
export const getInngestFunctions = (deps: InngestFunctionsDeps) => [
  createHelloWorldFn(deps),
  createUserOnboardingFn(deps),
];
```

### 4. Enviar Eventos

```typescript
// Desde un Use Case o Controller
import { inngest } from '@/shared/infrastructure/inngest-client/client.js';

await inngest.send({
  name: 'user/created',
  data: {
    userId: user.id,
    email: user.email,
    name: user.name,
  },
});
```

---

## Step Patterns

```typescript
// step.run: Operación atómica con reintentos
await step.run('step-id', async () => {
  return await someOperation();
});

// step.sleep: Esperar tiempo
await step.sleep('wait-1-hour', '1h');

// step.waitForEvent: Esperar otro evento
const result = await step.waitForEvent('wait-for-event', {
  event: 'user/completed',
  timeout: '3d',
});
```

---

## Desarrollo Local

```bash
# Levantar Inngest Dev Server
docker-compose up -d inngest

# Dashboard
http://localhost:8288
```

---

## Resources

- **Patrones**: Ver [assets/inngest-patterns.ts](assets/inngest-patterns.ts)
- **Documentación**: [docs/INNGEST.md](../../docs/INNGEST.md)
- **Client**: Ver `src/shared/infrastructure/inngest-client/`
