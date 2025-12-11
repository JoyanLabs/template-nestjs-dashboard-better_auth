# 🚀 Setup Guide

Complete guide to configure the project and deploy it to Dokploy.

---

## 📋 Table of Contents

1. [Initial Configuration](#initial-configuration)
2. [Dokploy Configuration](#dokploy-configuration)
3. [Environment Variables](#environment-variables)
4. [Branches & Workflow](#branches--workflow)
5. [Automatic Releases (Optional)](#automatic-releases-optional)
6. [GitHub Actions](#github-actions)

---

## 🎯 Initial Configuration

### 1. Environment Variables

Your project uses these variables:

```env
# Basics (already configured)
ENABLE_EXPERIMENTAL_COREPACK=1
LOGGER_LEVEL=log
PORT=3000

# Add as needed:
# NODE_ENV=development|staging|production
# DATABASE_URL=postgresql://...
# JWT_SECRET=...
```

### 2. Create Branches

```bash
# Create develop
git checkout -b develop
git push origin develop

# Create staging  
git checkout -b staging
git push origin staging

# Return to main
git checkout main
```

---

## 🐳 Dokploy Configuration

### Key Concepts

- **Build Type:** `Dockerfile` (uses existing Dockerfile)
- **Docker Context Path:** `.` (project root)
- **Docker Build Stage:** Multi-stage Dockerfile stage to use

### Dockerfile Stages:
```
base → dev (development)
    → build (compilation)
    → production (optimized)
```

---

## 📊 Environment Configuration

### **Environment 1: Development**

```yaml
# In Dokploy
Project: your-project-name
Environment: Development

Service:
  Name: app-dev
  Branch: develop
  Auto Deploy: ✅ Enabled

Build:
  Build Type: Dockerfile
  Docker Context Path: .
  Docker Build Stage: dev

Variables (Environment):
  NODE_ENV=development
  LOGGER_LEVEL=debug
  PORT=3000
  ENABLE_EXPERIMENTAL_COREPACK=1
```

**Why `LOGGER_LEVEL=debug`?**
- Maximum debugging info
- See full NestJS lifecycle
- Detailed request/response logs

---

### **Environment 2: Staging**

```yaml
# In Dokploy
Environment: Staging

Service:
  Name: app-staging
  Branch: staging
  Auto Deploy: ✅ Enabled

Build:
  Build Type: Dockerfile
  Docker Context Path: .
  Docker Build Stage: production  ← ⚠️ Use production, not dev

Variables (Environment):
  NODE_ENV=staging
  LOGGER_LEVEL=log
  PORT=3000
  ENABLE_EXPERIMENTAL_COREPACK=1
  # DATABASE_URL=...
```

**Why `LOGGER_LEVEL=log`?**
- Balance between info and performance
- Less noise than debug
- Similar to production but with more detail

**⚠️ Important:** Staging uses Build Stage `production` (same as prod), only variables change.

---

### **Environment 3: Production**

```yaml
# In Dokploy
Environment: Production

Service:
  Name: app-prod
  Branch: main
  Auto Deploy: ❌ Disabled (manual)

Build:
  Build Type: Dockerfile
  Docker Context Path: .
  Docker Build Stage: production

Variables (Environment):
  NODE_ENV=production
  LOGGER_LEVEL=warn
  PORT=3000
  ENABLE_EXPERIMENTAL_COREPACK=1
  # DATABASE_URL=...
```

**Why `LOGGER_LEVEL=warn`?**
- Only warnings and errors
- Optimal performance
- Reduces log storage costs

---

## 📝 Environment Variables

### Available Logger Levels

```
verbose → debug → log → warn → error → fatal
(more detail)              (less detail)
```

| Environment | LOGGER_LEVEL | Shows |
|-------------|--------------|-------|
| Development | `debug` | Everything (lifecycle, queries, requests) |
| Staging | `log` | General info |
| Production | `warn` | Only warnings and errors |

---

## 🔄 Branches & Workflow

### Branch Strategy

```
feature/* → develop → staging → main
            (auto)    (auto)    (manual)
```

### Daily Workflow

```bash
# 1. Create feature
git checkout develop
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit

# 3. Push and create PR
git push origin feature/new-feature
# Create PR to develop in GitHub

# 4. After merge to develop
# → Dokploy auto-deploys to Development

# 5. Test in staging
git checkout staging
git merge develop
git push origin staging
# → Dokploy auto-deploys to Staging

# 6. Deploy to production
git checkout main
git merge staging
git push origin main
# → Manual deploy in Dokploy
```

---

## 🚀 Automatic Releases (Optional)

### ⚠️ Current Status

**NOT configured** - Automatic releases require additional setup.

### To Enable (Optional)

**Step 1:** Install dependencies
```bash
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git
```

**Step 2:** Create `.releaserc.json`
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

**Step 3:** Create `.github/workflows/release.yml`
```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install pnpm
        run: npm install -g pnpm@10.19.0
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

**Release Types:**
- `fix:` → Patch (1.0.0 → 1.0.1)
- `feat:` → Minor (1.0.0 → 1.1.0)
- `feat!:` → Major (1.0.0 → 2.0.0)

---

## ⚙️ GitHub Actions

### Active Workflows

| Workflow | Function | Status |
|----------|----------|--------|
| `node.yml` | Build, lint, tests | ✅ Ready |
| `lint-all.yml` | Lint Dockerfile, YAML, etc | ✅ Ready |
| `conventional-label.yml` | Label PRs by type | ✅ Ready |
| `dependabot-auto-merge.yml` | Auto-merge Dependabot | ⚠️ Needs token |
| `sync-labels.yml` | Sync labels | ✅ Ready |
| `todo-to-issue.yml` | TODOs → Issues | ✅ Ready |

---

## ✅ Final Checklist

### Before deploying:

- [ ] Environment variables configured in `.env`
- [ ] Branches created: `develop`, `staging`, `main`
- [ ] 3 Environments configured in Dokploy
- [ ] Correct Build Stage in each environment:
  - [ ] Development → `dev`
  - [ ] Staging → `production`
  - [ ] Production → `production`

### To test:

```bash
# Locally
docker-compose up -d app-dev
curl http://localhost:3000/api/health
```

---

## 🔑 Quick Summary

### Dokploy: 3 Environments

| Environment | Branch | Build Stage | LOGGER_LEVEL | Auto Deploy |
|-------------|--------|-------------|--------------|-------------|
| Development | `develop` | `dev` | `debug` | ✅ Yes |
| Staging | `staging` | `production` | `log` | ✅ Yes |
| Production | `main` | `production` | `warn` | ❌ Manual |

---

## 📞 Support

- 📧 Contact: Joyan Labs Team
- 🐛 Report issues in the repository
- 📚 NestJS Docs: https://docs.nestjs.com
- 📚 Dokploy Docs: https://docs.dokploy.com
