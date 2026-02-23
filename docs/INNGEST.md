# Inngest - Procesamiento de Tareas Asíncronas

Guía completa para implementar tareas asíncronas con Inngest.

---

## ¿Qué es Inngest?

Inngest es un gestor de tareas asíncronas que permite:
- Ejecutar código en background (fuera del request/response cycle)
- Retries automáticos con backoff exponencial
- Orquestación de workflows con steps
- Scheduling de tareas

---

## Arquitectura

```
┌─────────────────────────────────────┐
│           Tu Aplicación             │
│  - Emite eventos con inngest.send() │
└─────────────────────────────────────┘
                  │
                  ▼ HTTP
┌─────────────────────────────────────┐
│        Inngest Server               │
│  - Recibe eventos                   │
│  - Encola tareas                    │
│  - Ejecuta functions                │
└─────────────────────────────────────┘
                  │
                  ▼ HTTP (async)
┌─────────────────────────────────────┐
│      /api/inngest (tu app)          │
│  - Ejecuta las functions            │
└─────────────────────────────────────┘
```

---

## Configuración

### 1. Instalación

```bash
pnpm add inngest
```

### 2. Variables de Entorno

```env
# Desarrollo
INNGEST_DEV=1
INNGEST_BASE_URL=http://localhost:8288

# Producción (Inngest Cloud)
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

### 3. Docker Compose

Ya está configurado en `docker-compose.yml`:

```yaml
inngest:
  image: inngest/inngest:latest
  ports:
    - "8288:8288"
  command: |
    inngest dev
    -u http://app:3001/api/inngest
    --port 8288
```

---

## Estructura

```
src/shared/infrastructure/inngest-client/
├── client.ts              # Instancia de Inngest
├── types.ts               # Definición de eventos
├── functions-factory.ts   # Factory de funciones
└── hello-world.fn.ts      # Ejemplo de función
```

---

## Crear una Función

### 1. Definir el Evento

```typescript
// types.ts
export type Events = {
  'user/created': {
    data: {
      userId: string;
      email: string;
      name: string;
    };
  };
};
```

### 2. Crear la Función

```typescript
// user-onboarding.fn.ts
import { inngest } from './client';

interface UserOnboardingDeps {
  logger: Logger;
  notificationService: INotificationService;
}

export const createUserOnboardingFn = (deps: UserOnboardingDeps) =>
  inngest.createFunction(
    { id: 'user-onboarding', retries: 3 },
    { event: 'user/created' },
    async ({ event, step }) => {
      const { userId, email, name } = event.data;

      // Step 1: Enviar email de bienvenida
      await step.run('send-welcome-email', async () => {
        await deps.notificationService.sendEmail({
          to: email,
          subject: 'Bienvenido',
          html: welcomeTemplate({ name }),
        });
      });

      // Step 2: Esperar 1 día
      await step.sleep('wait-1-day', '1d');

      // Step 3: Enviar email de follow-up
      await step.run('send-followup', async () => {
        await deps.notificationService.sendEmail({
          to: email,
          subject: '¿Cómo te va?',
          html: followUpTemplate({ name }),
        });
      });

      return { success: true, userId };
    },
  );
```

### 3. Registrar en el Factory

```typescript
// functions-factory.ts
export const getInngestFunctions = (deps: InngestFunctionsDeps) => [
  createHelloWorldFn(deps),
  createUserOnboardingFn(deps), // <-- Agregar aquí
];
```

---

## Emitir Eventos

```typescript
import { inngest } from '@/shared/infrastructure/inngest-client/client';

// En un controller o handler
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

## Dashboard

Accede al dashboard de Inngest en desarrollo:
- URL: http://localhost:8288

En producción (Inngest Cloud):
- URL: https://app.inngest.com

---

## Steps Disponibles

```typescript
// step.run: Ejecutar código
const result = await step.run('step-name', async () => {
  return await someOperation();
});

// step.sleep: Esperar tiempo
await step.sleep('wait', '1h');

// step.waitForEvent: Esperar otro evento
const event = await step.waitForEvent('wait-for-payment', {
  event: 'payment/received',
  timeout: '3d',
});
```

---

## Recursos

- **Skill**: `skills/inngest/SKILL.md`
- **Inngest Docs**: https://www.inngest.com/docs
