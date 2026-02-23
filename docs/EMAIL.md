# Email Service - Guía de Implementación

Guía completa para implementar el servicio de email usando el patrón Ports & Adapters con Mailtrap.

---

## Arquitectura

El sistema de email sigue el patrón **Ports & Adapters** (Arquitectura Hexagonal):

```
┌─────────────────────────────────────┐
│        Capa de Aplicación         │
│  - Use Cases / Handlers            │
│  - INotificationService (Port)     │
└─────────────────────────────────────┘
                  │
                  ▼ Depends on
┌─────────────────────────────────────┐
│      Capa de Infraestructura       │
│  - MailtrapAdapter (Adapter)       │
│  - EmailTemplates                  │
└─────────────────────────────────────┘
```

---

## Configuración

### 1. Variables de Entorno

```env
# Mailtrap Configuration
MAILTRAP_API_TOKEN=your-mailtrap-api-token
MAILTRAP_SENDER_EMAIL=hello@example.com
MAILTRAP_SENDER_NAME="My App"
MAILTRAP_SANDBOX=true
MAILTRAP_INBOX_ID=123456
```

### 2. Registro en Módulo

```typescript
// app.module.ts o shared.module.ts
import { NOTIFICATION_SERVICE } from '@/shared/application/ports/notification-service.port';
import { MailtrapAdapter } from '@/shared/infrastructure/adapters/mailtrap.adapter';

@Module({
  providers: [
    {
      provide: NOTIFICATION_SERVICE,
      useFactory: (configService: ConfigService) => {
        return new MailtrapAdapter({
          apiToken: configService.get('MAILTRAP_API_TOKEN'),
          senderEmail: configService.get('MAILTRAP_SENDER_EMAIL'),
          senderName: configService.get('MAILTRAP_SENDER_NAME'),
          sandbox: configService.get('NODE_ENV') !== 'production',
          inboxId: Number(configService.get('MAILTRAP_INBOX_ID')),
        });
      },
      inject: [ConfigService],
    },
  ],
})
```

---

## Uso

### En un Handler (CQRS)

```typescript
import { NOTIFICATION_SERVICE, INotificationService } from '@/shared/application/ports/notification-service.port';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(command: CreateUserCommand) {
    // ... crear usuario ...

    // Enviar email de bienvenida
    await this.notificationService.sendEmail({
      to: command.email,
      subject: 'Bienvenido a nuestra plataforma',
      html: welcomeTemplate({ name: command.name }),
    });
  }
}
```

### Templates de Email

```typescript
// email-templates.ts
export const welcomeTemplate = (data: { name: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>¡Bienvenido, ${data.name}!</h1>
    <p>Gracias por registrarte en nuestra plataforma.</p>
  </div>
</body>
</html>
`;
```

---

## Testing

```typescript
// En tests unitarios
const mockNotificationService: INotificationService = {
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-123',
    provider: 'mailtrap',
  }),
};

// En el test module
providers: [
  {
    provide: NOTIFICATION_SERVICE,
    useValue: mockNotificationService,
  },
]
```

---

## Cambiar de Proveedor

Para cambiar a otro proveedor (AWS SES, SendGrid, etc.):

1. Crea un nuevo adapter implementando `INotificationService`
2. Cambia el `useClass` en el módulo
3. No necesitas cambiar ningún handler

```typescript
// Ejemplo: SendGridAdapter
@Injectable()
export class SendGridAdapter implements INotificationService {
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Implementación con SendGrid
  }
}
```

---

## Recursos

- **Skill**: `skills/email-mailtrap/SKILL.md`
- **Mailtrap Docs**: https://mailtrap.io/docs/
