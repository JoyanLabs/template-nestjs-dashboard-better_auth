<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="images/nestjs.png" alt="Nest Logo" width="512" /></a>
</p>

<h1 align="center">🚀 NestJS Express Biome Template | Joyan Labs</h1>

<p align="center">
  A high-performance, production-ready NestJS template with Express, Biome, and Docker.
</p>

<p align="center">
  <a href="https://nodejs.org/docs/latest-v22.x/api/index.html"><img src="https://img.shields.io/badge/node-22.x-green.svg" alt="node"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-5.x-blue.svg" alt="typescript"/></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-9.x-red.svg" alt="pnpm"/></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Web_Framework-Express_⚡-black.svg" alt="express"/></a>
  <a href="https://swc.rs/"><img src="https://img.shields.io/badge/Compiler-SWC_-orange.svg" alt="swc"/></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Test-Vitest_-yellow.svg" alt="swc"/></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Dockerized 🐳_-blue.svg" alt="docker"/></a>
</p>

---

## 🎯 About The Project

This template provides a solid foundation for building scalable and efficient backend services using NestJS. It incorporates best practices, modern tooling, and a fully dockerized environment.

### Key Features

- ⚡️ **Express**: Stable and widely supported web framework.
- 🧹 **Biome**: Fast formatter and linter (replacing Prettier/ESLint).
- 🐳 **Dockerized**: Ready for development and production.
- 🧪 **Testing**: Vitest for Unit/E2E tests and k6 for performance testing.
- 👷 **SWC**: Super-fast compilation.
- 🐶 **Husky**: Git hooks for code quality.
- 📦 **pnpm**: Efficient package manager.
- 🐦‍🔥 **ESModules**: Modern JavaScript standard.

---

## 🌟 What's Included?

1. **🐳 Fully Dockerized**: Optimized Dockerfile for dev and prod.
2. **👷 SWC Compiler**: ~20x faster than standard TypeScript compiler.
3. **⚡️ Express**: Industry standard for Node.js applications.
4. **🐶 Husky Integration**:
   - Linting on commit
   - Conventional commits
   - Automatic testing
   - Type checking
   - Spell checking
5. **🗂️ Separated Tests**: Tests live in a dedicated `tests` directory.
6. **🧪 Vitest & Supertest**: Modern testing stack.
7. **🏎️ k6 Performance Tests**: Integrated load testing.
8. **📌 Path Aliases**: Clean imports (e.g., `@/shared`).
9. **🚀 CI/CD**: GitHub Actions workflows included.

---

## 🧑‍💻 Development

### Initial Setup

Create your `.env` file:

```bash
cp .env.example .env
```

Install `pnpm` globally:

```bash
npm install -g pnpm@10.19.0
```

### Development Mode

Start the application in **development mode** with hot-reload:

```bash
docker-compose up -d app-dev
```

The app will be available at `http://localhost:3000`. Debug port `9229` is exposed.

#### VSCode Debug Configuration

Add this to `.vscode/launch.json`:

```json
{
  "version": "0.1.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to docker",
      "restart": true,
      "port": 9229,
      "remoteRoot": "/app"
    }
  ]
}
```

### Production Mode

Run the **production** build:

```bash
docker-compose up -d app-production
```

### Health Check

Verify the service is running:

```bash
curl --request GET \
  --url http://localhost:3000/health
```

### Stop Service

```bash
docker-compose down
```

---

## ⚙️ Build

```bash
pnpm run build
```

---

## ✅ Testing

### Run All Tests

```bash
pnpm run test
```

### Unit Tests

```bash
pnpm run test:unit
```

### E2E Tests

```bash
pnpm run test:e2e
```

### Performance Tests (k6)

**Via Docker:**

```bash
docker-compose up k6
```

**Locally:**

```bash
brew install k6
pnpm run test:performance
```

---

## 💅 Linting

### Check Code

```bash
pnpm run lint
```

### Fix Issues

```bash
pnpm run lint:fix
```

---

## ⚙️ Setup & Deployment

📚 **See [docs/SETUP.md](docs/SETUP.md) for:**
- Dokploy Configuration
- Environment Variables
- Deployment Workflows

---

## 📝 License

Developed with ❤️ by **Joyan Labs**
