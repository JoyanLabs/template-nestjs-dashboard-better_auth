---
name: vitest-testing
description: >
  Patrones de testing con Vitest para NestJS.
  Trigger: Cuando se escriben tests unitarios, tests e2e, o se configura el entorno de testing.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Escribiendo tests con Vitest"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## When to Use

Usa esta skill cuando:
- Escribas tests unitarios para servicios, use cases o repositorios
- Crees tests e2e para controllers
- Necesites mockear dependencias
- Configures el entorno de testing

---

## Estructura de Tests

```
tests/
├── unit/                    # Tests unitarios
│   └── contexts/
│       └── {context}/
│           └── {feature}.test.ts
├── e2e/                     # Tests end-to-end
│   └── {feature}.test.ts
└── utils/
    └── mock.ts              # Utilidades de mocking
```

---

## Critical Patterns

### 1. Test Unitario de Handler (CQRS)

```typescript
import { Test } from '@nestjs/testing';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateUserHandler);
    repository = module.get(USER_REPOSITORY);
  });

  it('should create user successfully', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: '1', ... });

    const result = await handler.execute(new CreateUserCommand(...));

    expect(result).toBeDefined();
    expect(repository.create).toHaveBeenCalled();
  });
});
```

### 2. Test E2E de Controller

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

### 3. Mocks con vitest-mock-extended

```typescript
import { mock } from 'vitest-mock-extended';

const repository = mock<IUserRepository>({
  findById: vi.fn().mockResolvedValue({ id: '1', name: 'Test' }),
});
```

---

## Commands

```bash
# Todos los tests
pnpm test

# Solo unitarios
pnpm test:unit

# Solo e2e
pnpm test:e2e

# Con coverage
pnpm test:cov
```

---

## Configuration

```typescript
// vitest.config.unit.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

---

## Resources

- **Config**: `vitest.config.unit.ts`, `vitest.config.e2e.ts`
- **Utils**: `tests/utils/mock.ts`
- **Vitest Docs**: https://vitest.dev/
