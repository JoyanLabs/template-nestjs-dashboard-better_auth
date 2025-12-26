# Arquitectura del Proyecto SPP - Backend

Este documento proporciona una visión general técnica del backend del proyecto SPP, detallando su estructura, patrones de diseño y estándares de desarrollo para escalar de forma ordenada y ágil.

## 🛠️ Stack Tecnológico

- **Framework**: [NestJS](https://nestjs.com/) (Express por defecto).
- **Lenguaje**: TypeScript.
- **Base de Datos**: PostgreSQL gestionado a través de **Prisma ORM**.
- **Autenticación**: [Better Auth](https://www.better-auth.com/) (integrado como middleware).
- **Herramientas**: Biome (Linter/Formatter), Vitest (Testing), Docker.

## 🏛️ Filosofía Arquitectónica

Buscamos una **Arquitectura Hexagonal Pragmática**:
- **Dominio**: Reglas de negocio puras (TS). No depende de NestJS ni de Prisma.
- **Aplicación**: Casos de uso que orquestan el flujo de datos.
- **Infraestructura**: Adaptadores (Prisma, Better Auth, Filtros). Aquí reside el framework y las dependencias externas.

### 🔐 Integración de Autenticación

Se utiliza **Better Auth** integrado de forma simplificada:
- **Middleware Global**: Intercepta prefijos `/api/auth` y delega el manejo a `toNodeHandler(auth)`, centralizando la lógica sin saturar los controllers.
- **AuthController de Paso**: Existe únicamente para proveer metadatos a Swagger/Scalar, permitiendo que la API esté documentada mientras que la ejecución real ocurre en la capa de middleware.
- **Prisma Adapter**: Conectado directamente a la base de datos PostgreSQL para gestión de sesiones y usuarios.

## 📁 Estructura de Carpetas

```text
src/
├── app/                    # Configuración global de NestJS (Module principal, Health, etc.)
├── contexts/               # Módulos de negocio (Contextos delimitados)
│   ├── [context_name]/
│   │   ├── api/            # Capa de Entrega (Controllers, Guards, Decoradores)
│   │   ├── application/    # Capa de Aplicación (Casos de uso, DTOs)
│   │   ├── domain/         # Capa de Dominio (Entidades, Interfaces de Repositorio)
│   │   └── infrastructure/ # Capa de Infraestructura (Persistencia, Adaptadores externos)
└── shared/                 # Código compartido por todos los contextos
    ├── domain/             # Clases base (BaseEntity, IRepository)
    ├── infrastructure/     # Implementaciones compartidas (Prisma, Logger, Filtros)
    └── exceptions/         # Excepciones base de dominio
```

---

## 🚀 Guía de Implementación para Nuevos Contextos

Para mantener la coherencia y agilidad, sigue este flujo al crear un nuevo módulo (ej: `projects`):

### 1. Entidad de Dominio (`domain/entities/project.entity.ts`)
Hereda de `BaseEntity`. No uses tipos de Prisma aquí.

```typescript
export class ProjectEntity extends BaseEntity {
  constructor(
    id: string,
    public name: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(props: { name: string }): ProjectEntity {
    return new ProjectEntity(crypto.randomUUID(), props.name);
  }
}
```

### 2. Contrato de Repositorio (`domain/repositories/project.repository.interface.ts`)
Define qué operaciones necesita el negocio, permitiendo el uso de transacciones opcionales.

```typescript
export interface IProjectRepository extends IRepository<ProjectEntity> {
  findByName(name: string, tx?: PrismaClientOrTransaction): Promise<ProjectEntity | null>;
}
```

### 3. Mapeo de Datos (`infrastructure/persistence/mappers/project.mapper.ts`)
Usa `cleanPrismaData` para reducir boilerplate en las actualizaciones (evita el ruido de campos `undefined`).

```typescript
export function projectToDomain(raw: PrismaProject): ProjectEntity {
  return new ProjectEntity(raw.id, raw.name, raw.createdAt, raw.updatedAt);
}

export function projectToPrismaCreate(entity: ProjectEntity): Prisma.ProjectCreateInput {
  return { id: entity.id, name: entity.name };
}

export function projectToPrismaUpdate(entity: Partial<ProjectEntity>): Prisma.ProjectUpdateInput {
  return cleanPrismaData({ name: entity.name });
}
```

### 4. Repositorio de Infraestructura (`infrastructure/repositories/prisma-project.repository.ts`)
Implementa el patrón `getClient(tx)` para soportar transacciones atómicas a través de múltiples repositorios.

---

## �️ Manejo de Errores (Centralizado)

**Regla de oro**: El Dominio lanza errores de negocio (`DomainException`), la Infraestructura los traduce a HTTP.

1. **Definición**: Las excepciones de dominio deben heredar de `DomainException` y son agnósticas a NestJS.
2. **Traducción**: El `DomainExceptionFilter` (`src/shared/infrastructure/filters/domain-exception.filter.ts`) captura estas excepciones globalmente y asigna el `HttpStatus` adecuado basándose en el código interno de la excepción.

---

## ⚖️ Análisis Crítico y Buenas Prácticas

**Lo que nos hace rápidos:**
- **Transacciones Pragmáticas**: El uso de `tx?` opcional permite orquestar transacciones complejas en los Casos de Uso sin sobrecargar los métodos simples.
- **Mappers Eficientes**: La utilidad `cleanPrismaData` automatiza la limpieza de datos para Prisma, eliminando cientos de líneas de código repetitivo.
- **Desacoplamiento Real**: El Filtro de Excepciones permite que el dominio no se contamine con códigos de estado HTTP.

**Cuándo no ser puristas:**
- **CRUDs Simples**: Si un módulo es puramente de lectura o un CRUD muy básico sin lógica, se permite mayor cercanía a los tipos de Prisma si esto ahorra tiempo significativo sin comprometer la escalabilidad de las entidades núcleo.
- **Validaciones**: Usa `Zod` o `class-validator` en los DTOs de entrada para fallar rápido en la frontera del sistema.

## 🛠️ Checklist de Desarrollo
1. [ ] Definir modelo en `schema.prisma` y ejecutar migración.
2. [ ] Crear `Entity` y `Repository Interface` en Dominio.
3. [ ] Crear `Mapper` y `PrismaRepository` en Infraestructura.
4. [ ] Inyectar repositorio en el módulo de NestJS usando un Token (interfaz).
5. [ ] Crear `UseCase` e inyectar la interfaz del repositorio.

---
*Última actualización: Diciembre 2025*
