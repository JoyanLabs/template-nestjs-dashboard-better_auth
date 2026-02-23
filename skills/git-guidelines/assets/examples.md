# Ejemplos de Uso: Git Guidelines con GitHub CLI

## Escenario 1: Verificar disponibilidad de gh

```bash
# Verificar si gh está instalado
$ command -v gh >/dev/null 2>&1 && echo "gh disponible" || echo "gh no disponible"
gh disponible

# Verificar autenticación
$ gh auth status
github.com
  ✓ Logged in to github.com as usuario
```

## Escenario 2: Crear un commit

**Usuario:** "quiero hacer un commit"

**AI:**
```bash
# 1. Analizar cambios staged
$ git diff --cached --stat
  skills/git-guidelines/SKILL.md | 204 +++++++++++++++++++++++++++++++--

# 2. Sugerir mensaje (siguiendo convenciones)
Sugerencia de commit:
  feat(git-guidelines): add gh cli support with confirmation flow

# 3. Ejecutar commit
$ git commit -m "feat(git-guidelines): add gh cli support with confirmation flow"
```

## Escenario 3: Crear un PR con gh CLI

**Usuario:** "crea el PR"

**AI:**
```bash
# 1. Verificar información del repo
$ gh repo view --json name,defaultBranch
{
  "name": "template-nestjs-dashboard",
  "defaultBranch": "main"
}

# 2. Verificar si ya existe PR
$ gh pr view --json title,number,state 2>/dev/null || echo "No existe PR"
No existe PR

# 3. SOLICITAR CONFIRMACIÓN
⚠️ Se creará el PR con el siguiente comando:
   gh pr create --base main --title "..." --body "..."
   
   ¿Ejecutar? (sí/no)

# 4. Usuario confirma con "sí"

# 5. Ejecutar comando
$ gh pr create --base main --title "..." --body "..."
https://github.com/user/template-nestjs-dashboard/pull/1
```

## Escenario 4: Push con confirmación

**Usuario:** "haz push"

**AI:**
```bash
# 1. Verificar rama actual
$ git branch --show-current
feat/new-feature

# 2. SOLICITAR CONFIRMACIÓN
⚠️ Se ejecutará:
   git push -u origin feat/new-feature
   
   ¿Ejecutar? (sí/no)

# 3. Usuario confirma con "sí"

# 4. Ejecutar
$ git push -u origin feat/new-feature
```

## Escenario 5: Fallback sin gh CLI

**Usuario:** "crea el PR"

**AI:**
```bash
# 1. Verificar disponibilidad
$ command -v gh >/dev/null 2>&1 && echo "gh disponible" || echo "gh no disponible"
gh no disponible

# 2. Modo fallback
⚠️ GitHub CLI no está disponible.

Aquí está la información para crear el PR manualmente:

**Título sugerido:**
```
feat(scope): description
```

**Descripción sugerida:**
```markdown
## Summary
Descripción de los cambios

## Cambios
- Cambio 1
- Cambio 2
```
```

---

## Resumen de Comandos por Categoría

### Información (no requieren confirmación)
- `gh auth status`
- `gh pr view`
- `gh pr list`
- `git log`, `git diff`, `git status`

### Acciones (SIEMPRE requieren confirmación)
- `gh pr create`
- `gh pr merge`
- `git push`
