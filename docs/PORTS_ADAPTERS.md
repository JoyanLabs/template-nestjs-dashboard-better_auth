# Ports & Adapters - Arquitectura Hexagonal

Guía completa del patrón Ports & Adapters en el template.

---

## Concepto

El patrón **Ports & Adapters** (también conocido como Arquitectura Hexagonal) desacopla la lógica de negocio de las dependencias externas.

```
              ┌─────────────────────────┐
              │    Mundo Exterior       │
              │  (Web, CLI, Tests)      │
              └───────────┬─────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               │               ▼
┌─────────────────┐       │      ┌─────────────────┐
│   HTTP Adapter   │       │      │  Email Adapter  │
│  (Controller)   │       │      │  (Mailtrap)     │
└────────┬────────┘       │      └────────┬────────┘
         │                │               │
         │    ┌───────────┴───────────┐   │
         │    │                       │   │
         └────►   Lógica de Negocio   ◄───┘
              │   (Application Core)  │
              │                       │
              │  ┌─────────────────┐  │
              │  │   Ports         │  │
              │  │  (Interfaces)   │  │
              │  └─────────────────┘  │
              └───────────────────────┘
```

---

## Componentes

### 1. Ports (Interfaces)

Definen el contrato que debe cumplir cualquier implementación.

```typescript
// notification-service.port.ts
export interface INotificationService {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
}

export const NOTIFICATION_SERVICE = Symbol('NOTIFICATION_SERVICE');
```

### 2. Adapters (Implementaciones)

Implementan los ports usando tecnologías específicas.

```typescript
// mailtrap.adapter.ts
@Injectable()
export class MailtrapAdapter implements INotificationService {
  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    // Implementación con Mailtrap
  }
}
```

### 3. Application Core

Depende de los ports, no de los adapters.

```typescript
// create-user.handler.ts
@CommandHandler(CreateUserCommand)
export class CreateUserHandler {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(command: CreateUserCommand) {
    // La lógica de negocio NO sabe qué proveedor de email se usa
    await this.notificationService.sendEmail({...});
  }
}
```

---

## Ports Disponibles

| Port | Ubicación | Descripción |
|------|-----------|-------------|
| `INotificationService` | `application/ports/notification-service.port.ts` | Envío de emails |
| `IStorageService` | `application/ports/storage-service.port.ts` | Almacenamiento de archivos |

---

## Adaptadores Implementados

| Adapter | Puerto | Tecnología |
|---------|--------|------------|
| `MailtrapAdapter` | `INotificationService` | Mailtrap |
| `CloudflareR2Adapter` | `IStorageService` | Cloudflare R2 |

---

## Agregar un Nuevo Puerto

```typescript
// application/ports/payment-service.port.ts
export interface IPaymentService {
  processPayment(params: PaymentParams): Promise<PaymentResult>;
  refund(paymentId: string): Promise<void>;
}

export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');
```

## Agregar un Nuevo Adaptador

```typescript
// infrastructure/adapters/stripe.adapter.ts
@Injectable()
export class StripeAdapter implements IPaymentService {
  async processPayment(params: PaymentParams): Promise<PaymentResult> {
    // Implementación con Stripe
  }
}
```

---

## Testing

Los ports permiten testing fácil con mocks:

```typescript
// Test module
providers: [
  {
    provide: NOTIFICATION_SERVICE,
    useValue: {
      sendEmail: jest.fn(),
    },
  },
]
```

---

## Beneficios

1. **Desacoplamiento**: La lógica de negocio no depende de tecnologías externas
2. **Testabilidad**: Fácil de mockear en tests
3. **Flexibilidad**: Cambiar de proveedor sin tocar la lógica de negocio
4. **Reusabilidad**: El mismo port puede tener múltiples adapters

---

## Recursos

- **Skill**: `skills/nestjs/SKILL.md`
