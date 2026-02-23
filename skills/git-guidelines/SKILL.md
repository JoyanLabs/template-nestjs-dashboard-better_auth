---
name: git-guidelines
description: >
  Guías para Git y GitHub: mensajes de commit, descripciones de PR, y templates.
  Usa GitHub CLI (gh) cuando esté disponible, con confirmación antes de comandos remotos.
  Trigger: Cuando el usuario pide crear commit, mensaje de commit, descripción de PR, o trabajar con templates de GitHub.
license: MIT
metadata:
  author: conasin-team
  version: "2.2"
  scope: [root]
  auto_invoke: "Creando commits, PRs, o usando templates de GitHub"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## When to Use

- Antes de ejecutar `git commit`
- Cuando el usuario dice "haz el commit", "sugiere mensaje de commit"
- Cuando el usuario pide crear/generar descripción de PR
- Cuando hay cambios staged listos para commitear
- Cuando hay commits listos para crear PR

---

## Critical Patterns

### Detección de GitHub CLI

**SIEMPRE verificar primero si `gh` está disponible:**

```bash
command -v gh >/dev/null 2>&1 && echo "gh disponible" || echo "gh no disponible"
```

- Si `gh` está disponible → Usar comandos `gh` para automatizar
- Si `gh` NO está disponible → Sugerir comandos manuales con git

### Regla de Oro: Confirmación antes de Comandos Remotos

**⚠️ SIEMPRE pedir confirmación explícita antes de ejecutar comandos que modifican el repositorio remoto:**

| Comando | Requiere Confirmación |
|---------|----------------------|
| `git push` | ✅ Sí |
| `gh pr create` | ✅ Sí |
| `gh pr merge` | ✅ Sí |
| `git commit` | ❌ No (local) |
| `git add` | ❌ No (local) |

### Convenciones de Commit

**SIEMPRE seguir estas reglas estrictas:**

| Regla | Ejemplo Correcto | Ejemplo Incorrecto |
|-------|-----------------|-------------------|
| Máx 100 caracteres | `feat(users): add email validation` | `feat(users): add email validation for new user registration form` |
| Sin mayúscula inicial | `fix(auth): handle token expiry` | `fix(auth): Handle token expiry` |
| Sin punto final | `docs(readme): update setup steps` | `docs(readme): update setup steps.` |
| Tipo en minúscula | `feat:` / `fix:` / `docs:` | `Feat:` / `Fix:` / `Docs:` |

**Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Formato:** `<type>[optional scope]: <description>`

---

## Commands

### Git Básico (siempre disponible)

```bash
# Ver cambios staged para analizar
git diff --cached --stat
git diff --cached

# Ver commits desde base branch
git log main..HEAD --oneline

# Ver archivos cambiados
git diff main...HEAD --stat
```

### GitHub CLI (cuando está disponible)

```bash
# Información (no requiere confirmación)
gh auth status
gh pr view
gh pr list
gh repo view

# Acciones (SIEMPRE requieren confirmación)
gh pr create --base main --title "<título>" --body "<descripción>"
git push -u origin <branch>
gh pr merge
```

---

## Resources

- **Ejemplos**: Ver [assets/examples.md](assets/examples.md) para casos de uso completos
- **gh CLI Docs**: https://cli.github.com/manual
