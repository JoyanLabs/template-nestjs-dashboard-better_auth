# 🚀 Quick Start - Dashboard Template (Backend)

Este repositorio es parte de la plantilla **Dashboard + Better Auth** de Joyan Labs.

## 🛠️ Requisitos previos

- **Node.js**: v22 o superior.
- **pnpm**: v10 o superior (`npm install -g pnpm`).
- **Docker**: Para levantar la base de datos PostgreSQL.

## 🏁 Pasos para iniciar

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno**:
   Copia `.env.example` a `.env` y ajusta los valores si es necesario.
   ```bash
   cp .env.example .env
   ```

3. **Levantar Base de Datos**:
   ```bash
   docker compose up -d postgres
   ```

4. **Ejecutar Migraciones de Prisma**:
   Esto crea las tablas necesarias (incluyendo las de Better Auth).
   ```bash
   npx prisma migrate dev
   ```

5. **Iniciar en modo desarrollo**:
   ```bash
   pnpm run dev
   ```

---

## 🐳 Probando la versión Dockerizada

Si quieres probar cómo corre el backend dentro de un contenedor:

### 🛠️ Modo Desarrollo (Docker)
Este modo usa volúmenes para reflejar cambios en caliente:
```bash
docker compose up --build app-dev
```

### 🚀 Modo Producción (Docker)
Este modo compila el proyecto y lo corre de forma optimizada:
```bash
docker compose up --build app-production
```

---

## 🔗 Repositorios de la Plantilla
- [Frontend (Nuxt 4)](https://github.com/JoyanLabs/template-nuxt4-dashboard-better_auth)
- [Backend (NestJS)](https://github.com/JoyanLabs/template-nestjs-dashboard-better_auth)
