---
name: email-mailtrap
description: >
  Servicio de notificaciones por email usando el patrón Ports & Adapters con Mailtrap.
  Trigger: Cuando se envían emails, se crean templates, o se implementa el patrón de notificaciones.
license: MIT
metadata:
  author: template-team
  version: "2.0"
  scope: [root]
  auto_invoke: "Enviando emails o implementando notificaciones"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Arquitectura: Ports & Adapters

El servicio de notificaciones sigue el patrón **Ports & Adapters**:

```
┌─────────────────────────────────────┐
│  CAPA DE APLICACIÓN                 │
│  - Handlers usan INotificationService│
│  - No conocen Mailtrap              │
└──────────────┬──────────────────────┘
               │ Inyección de dependencias
┌──────────────▼──────────────────────┐
│  PUERTO: INotificationService       │
│  - Interfaz (contrato)              │
│  - Define sendEmail()               │
└──────────────┬──────────────────────┘
               │ Implementación
┌──────────────▼──────────────────────┐
│  ADAPTADOR: MailtrapAdapter         │
│  - Implementa INotificationService  │
│  - Usa Mailtrap SDK                 │
└─────────────────────────────────────┘
```

**Ubicación de archivos:**
```
src/shared/
├── application/ports/
│   └── notification-service.port.ts   # Puerto (interfaz)
└── infrastructure/adapters/
    └── mailtrap.adapter.ts            # Adaptador (Mailtrap)
```

---

## Critical Patterns

### 1. Puerto (Interfaz)

```typescript
// shared/application/ports/notification-service.port.ts
export interface INotificationService {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
}

export const NOTIFICATION_SERVICE = Symbol('NOTIFICATION_SERVICE');

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
```

### 2. Adaptador (Implementación)

```typescript
// shared/infrastructure/adapters/mailtrap.adapter.ts
@Injectable()
export class MailtrapAdapter implements INotificationService {
  private client: MailtrapClient;

  constructor(config: { apiToken: string; senderEmail: string }) {
    this.client = new MailtrapClient({ token: config.apiToken });
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    const response = await this.client.send({
      from: { email: this.senderEmail },
      to: [{ email: params.to }],
      subject: params.subject,
      html: params.html,
    });

    return {
      success: true,
      messageId: String(response.message_ids?.[0]),
      provider: 'mailtrap',
    };
  }
}
```

### 3. Uso en Handlers (Inyección)

```typescript
// En un handler CQRS
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NOTIFICATION_SERVICE,
  INotificationService,
} from '@/shared/application/ports/notification-service.port.js';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(command: CreateUserCommand) {
    // Crear usuario...
    
    // Enviar email usando el puerto (no Mailtrap directamente)
    await this.notificationService.sendEmail({
      to: command.email,
      subject: 'Bienvenido a nuestra plataforma',
      html: welcomeTemplate({ name: command.name }),
    });
  }
}
```

### 4. Configuración en Módulo

```typescript
// shared/shared.module.ts o app.module.ts
import { Module } from '@nestjs/common';
import { NOTIFICATION_SERVICE } from './application/ports/notification-service.port.js';
import { MailtrapAdapter } from './infrastructure/adapters/mailtrap.adapter.js';

@Module({
  providers: [
    {
      provide: NOTIFICATION_SERVICE,
      useFactory: () => {
        return new MailtrapAdapter({
          apiToken: process.env.MAILTRAP_API_TOKEN!,
          senderEmail: process.env.MAILTRAP_SENDER_EMAIL || 'hello@example.com',
        });
      },
    },
  ],
  exports: [NOTIFICATION_SERVICE],
})
export class SharedModule {}
```

### 5. Templates de Email

Los templates se mantienen en `shared/infrastructure/email/email.templates.ts`:

```typescript
// email.templates.ts
export interface WelcomeData {
  name: string;
  resetUrl: string;
  appName?: string;
}

export function welcomeTemplate(data: WelcomeData): string {
  const { name, resetUrl, appName = 'Tu Aplicación' } = data;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hola ${name},</h1>
        <p>Bienvenido a ${appName}.</p>
        <p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Configurar cuenta
          </a>
        </p>
      </body>
    </html>
  `;
}
```

---

## Agregar Nuevo Template

1. **Crear interfaz y función** en `email.templates.ts`:

```typescript
interface PasswordResetData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetTemplate(data: PasswordResetData): string {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Hola ${data.name}</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <a href="${data.resetUrl}">Restablecer contraseña</a>
        <p>Este enlace expira en ${data.expiresIn}.</p>
      </body>
    </html>
  `;
}
```

2. **Exportar** en `index.ts`:

```typescript
export { welcomeTemplate, passwordResetTemplate } from './email.templates.js';
```

3. **Usar en handler**:

```typescript
await this.notificationService.sendEmail({
  to: user.email,
  subject: 'Restablecer contraseña',
  html: passwordResetTemplate({
    name: user.name,
    resetUrl: generateResetUrl(user.email),
    expiresIn: '24 horas',
  }),
});
```

---

## Envío Asíncrono con Inngest

**Recomendado**: Usar Inngest para envío de emails en background:

```typescript
// Función Inngest
export const createUserOnboardingFn = ({
  notificationService,
  logger,
}: Deps) =>
  inngest.createFunction(
    { id: 'user-onboarding' },
    { event: 'user/created' },
    async ({ event, step }) => {
      const { email, name } = event.data;

      // Step con reintentos automáticos
      await step.run('send-welcome-email', async () => {
        return notificationService.sendEmail({
          to: email,
          subject: 'Bienvenido a nuestra plataforma',
          html: welcomeTemplate({ name, resetUrl: generateUrl(email) }),
        });
      });
    },
  );
```

**Ventajas:**
- ✅ Reintentos automáticos si falla Mailtrap
- ✅ No bloquea la respuesta HTTP
- ✅ Observabilidad en dashboard de Inngest
- ✅ Desacoplamiento completo

---

## Modos de Operación

### Sandbox (Desarrollo)

Los emails NO se envían realmente, se capturan en Mailtrap:

```env
MAILTRAP_SANDBOX=true
```

Ver emails en: https://mailtrap.io/inboxes

### Producción

Los emails se envían realmente:

```env
MAILTRAP_SANDBOX=false
MAILTRAP_SENDER_EMAIL=noreply@tudominio.com
```

Requisitos:
- Dominio verificado en Mailtrap
- Email de remitente del dominio verificado

---

## Variables de Entorno

```env
# Requerido
MAILTRAP_API_TOKEN=tu-api-token

# Remitente
MAILTRAP_SENDER_EMAIL=hello@demomailtrap.com
MAILTRAP_SENDER_NAME=Tu Aplicación

# Modo
MAILTRAP_SANDBOX=true

# Opcional (para sandbox)
MAILTRAP_INBOX_ID=tu-inbox-id
```

---

## Decision Tree

```
¿Necesitas enviar emails?
│
├─ ¿Es parte de un flujo de negocio (ej: onboarding)?
│  ├─ SÍ: ¿Puede fallar sin afectar la operación principal?
│  │  ├─ SÍ: Usar Inngest (recomendado)
│  │  │        → Inyectar notificationService
│  │  │        → Usar step.run() para reintentos
│  │  └─ NO: Usar puerto directamente en handler
│  │
│  └─ NO: Usar puerto directamente (respuesta inmediata)
│
└─ ¿Es un template nuevo?
   ├─ SÍ: Crear en email.templates.ts
   │        → Exportar en index.ts
   │        → Usar en handler
   └─ NO: Usar template existente

¿Qué template usar?
├── Usuario nuevo (admin crea)     → welcomeTemplate
├── Restablecer contraseña         → passwordResetTemplate
├── Notificación genérica          → Crear nuevo template
```

---

## Testing con Mocks

El patrón Ports & Adapters facilita testing:

```typescript
// Test unitario
import { Test } from '@nestjs/testing';
import { CreateUserHandler } from './create-user.handler';
import {
  NOTIFICATION_SERVICE,
  INotificationService,
} from '@/shared/application/ports/notification-service.port.js';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockNotificationService: jest.Mocked<INotificationService>;

  beforeEach(async () => {
    mockNotificationService = {
      sendEmail: jest.fn().mockResolvedValue({
        success: true,
        messageId: 'test-123',
        provider: 'mock',
      }),
    } as unknown as jest.Mocked<INotificationService>;

    const module = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: NOTIFICATION_SERVICE,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
  });

  it('should send welcome email', async () => {
    await handler.execute(command);

    expect(mockNotificationService.sendEmail).toHaveBeenCalledWith({
      to: command.email,
      subject: expect.any(String),
      html: expect.any(String),
    });
  });
});
```

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "Cannot find module" | Import incorrecto | Usar `@/shared/application/ports/notification-service.port.js` |
| "NOTIFICATION_SERVICE not found" | No exportado en módulo | Agregar a providers y exports en SharedModule |
| Emails no enviados | Sandbox habilitado | Verificar `MAILTRAP_SANDBOX=false` en prod |
| Error de autenticación | Token inválido | Regenerar token en Mailtrap dashboard |
| Emails no llegan | Sandbox inbox incorrecto | Configurar `MAILTRAP_INBOX_ID` correcto |

---

## Cambiar de Proveedor

El patrón Ports & Adapters permite cambiar fácilmente de Mailtrap a otro proveedor:

```typescript
// Crear nuevo adaptador
@Injectable()
export class SESAdapter implements INotificationService {
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Implementación con AWS SES
    return { success: true, provider: 'ses' };
  }
}

// Cambiar en configuración
{
  provide: NOTIFICATION_SERVICE,
  useClass: process.env.NODE_ENV === 'production' 
    ? SESAdapter 
    : MailtrapAdapter,
}
```

**No es necesario modificar handlers** - solo cambiar el adaptador en el módulo.

---

## Resources

### Documentación Relacionada
- **NestJS**: Ver guía de arquitectura hexagonal y CQRS
- **Inngest Integration**: Tareas asíncronas y eventos
- **Arquitectura Hexagonal**: Visión general del patrón

### Dependencias
La skill requiere que `mailtrap` esté instalado:
```bash
npm install mailtrap
```

### Skills Relacionados
- **nestjs** - CQRS y arquitectura hexagonal
- **documentation** - Crear documentación
