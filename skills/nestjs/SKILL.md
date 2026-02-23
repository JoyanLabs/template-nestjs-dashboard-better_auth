---
name: nestjs
description: >
  Patrones de arquitectura hexagonal + CQRS con NestJS.
  Trigger: Cuando se crean controladores, módulos, commands, queries, handlers, o se trabaja con inyección de dependencias.
license: MIT
metadata:
  author: template-team
  version: "2.1"
  scope: [root]
  auto_invoke: "Creando controladores, commands o queries NestJS"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Arquitectura Hexagonal + CQRS

```
src/contexts/{context}/
├── api/                         # Capa de Entrega
│   ├── {entity}.controller.ts   # Usa CommandBus/QueryBus
│   └── {entity}.dto.ts
├── application/                 # Capa de Aplicación (CQRS)
│   ├── commands/                # Operaciones de escritura
│   ├── queries/                 # Operaciones de lectura
│   └── ports/                   # Interfaces (contratos)
├── domain/                      # Capa de Dominio (pura)
│   ├── entities/
│   └── repositories/
└── infrastructure/              # Capa de Infraestructura
    ├── adapters/                # Implementaciones de puertos
    └── persistence/             # Prisma, mappers
```

---

## Critical Patterns

### 1. CQRS con @nestjs/cqrs

SIEMPRE separar operaciones de escritura (Commands) y lectura (Queries):

```typescript
// application/commands/create-user/create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly headers: Headers,
  ) {}
}

// application/commands/create-user/create-user.handler.ts
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(command: CreateUserCommand) {
    return this.authService.createUser({
      email: command.email,
      name: command.name,
    }, command.headers);
  }
}
```

### 2. Puertos y Adaptadores

SIEMPRE abstraer servicios externos con interfaces:

```typescript
// application/ports/auth-service.port.ts
export interface IAuthService {
  createUser(params: CreateUserParams, headers: Headers): Promise<UserData>;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

// infrastructure/adapters/better-auth.adapter.ts
@Injectable()
export class BetterAuthAdapter implements IAuthService {
  async createUser(params: CreateUserParams, headers: Headers): Promise<UserData> {
    const result = await auth.api.createUser({ headers, body: params });
    return this.mapUser(result.user);
  }
}
```

### 3. Controladores con CQRS

Los controladores NO contienen lógica, solo crean Commands/Queries:

```typescript
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const command = new CreateUserCommand(
      dto.email,
      dto.name,
      toWebHeaders(req.headers),
    );
    return this.commandBus.execute(command);
  }
}
```

---

## Decision Tree

```
¿Dónde crear el archivo?
├── Recibe HTTP requests?           → api/ (Controller, DTO)
├── Operación de escritura?         → application/commands/
├── Operación de lectura?           → application/queries/
├── Abstraer servicio externo?      → application/ports/
├── Implementar puerto?             → infrastructure/adapters/
├── Define reglas de negocio?       → domain/entities/
├── Implementa persistencia?        → infrastructure/persistence/
└── Configura módulo NestJS?        → {context}.module.ts

¿Command o Query?
├── Modifica estado? (create, update, delete) → Command
└── Solo lee datos? (get, list, search)       → Query
```

---

## Resources

- **Patrones**: Ver [assets/nestjs-patterns.ts](assets/nestjs-patterns.ts)
- **Documentación**: [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- **Better Auth**: Ver skill `better-auth`
