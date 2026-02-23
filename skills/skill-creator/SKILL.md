---
name: skill-creator
description: >
  Crea nuevos AI agent skills siguiendo el estándar de agentskills.io.
  Trigger: Cuando se necesita crear un nuevo skill para el proyecto.
license: MIT
metadata:
  author: conasin-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Creando nuevos skills"
allowed-tools: Read, Edit, Write
---

## When to Use

Usa este skill cuando:
- Necesitas documentar un patrón técnico nuevo
- Creas una integración con un servicio externo
- Identificas un workflow repetitivo que vale la pena estandarizar
- Quieres encapsular conocimiento específico del proyecto

**NO usar cuando:**
- Es una pregunta puntual que no se repetirá
- La información ya existe en otro skill
- Es sobre tecnologías estándar (usar `context7-docs` en su lugar)

---

## Critical Rules

### 1. Un Skill = Un Propósito

Cada skill debe enfocarse en **una sola cosa**:

✅ **BIEN:**
- `better-auth`: Todo sobre autenticación
- `prisma`: Patrones de base de datos
- `nestjs`: Arquitectura hexagonal

❌ **MAL:**
- `backend-patterns`: Demasiado amplio
- `my-code`: No describe el propósito

### 2. Estructura de Archivos

```
skills/{skill-name}/
├── SKILL.md              # Archivo principal (REQUERIDO)
├── assets/               # Código de ejemplo, templates (OPCIONAL)
│   └── *.ts, *.sh
└── references/           # Documentación adicional (OPCIONAL)
    └── *.md
```

### 3. Frontmatter Obligatorio

```yaml
---
name: {skill-name}
description: >
  {Descripción en una línea}.
  Trigger: {Cuándo invocar este skill - ser específico}.
license: MIT
metadata:
  author: {autor}
  version: "1.0"
  scope: [root]
  auto_invoke: "{Acción que dispara el skill}"
allowed-tools: Read, Edit, Write, Glob, Grep
---
```

### 4. Campos Importantes

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `name` | Nombre único del skill | `better-auth` |
| `description` | Qué hace + cuándo usar | Integración con Better Auth... |
| `metadata.auto_invoke` | Acciones que activan el skill | "Trabajando con autenticación" |
| `allowed-tools` | Herramientas que puede usar | Read, Edit, Write |

---

## Template SKILL.md

Usa este template como base:

```markdown
---
name: {skill-name}
description: >
  {Descripción del skill}.
  Trigger: {Cuándo la IA debería cargar este skill}.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "{Acción que dispara}"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## When to Use

Usa este skill cuando:
- {Condición 1}
- {Condición 2}
- {Condición 3}

**NO usar cuando:**
- {Cuándo NO usar}

---

## Critical Patterns

### Pattern 1: {Nombre}

\`\`\`{language}
{código de ejemplo}
\`\`\`

---

## Commands

\`\`\`bash
{comando}  # {descripción}
\`\`\`

---

## Resources

- **Assets**: Ver [assets/](assets/)
- **References**: Ver [references/](references/)
```

---

## Workflow de Creación

```
1. Verificar que no existe skill similar
   └─ grep -r "{concepto}" skills/

2. Crear estructura de directorios
   └─ mkdir -p skills/{nombre}/{assets,references}

3. Copiar template
   └─ cp skills/skill-creator/assets/SKILL-TEMPLATE.md \
        skills/{nombre}/SKILL.md

4. Editar SKILL.md con contenido específico

5. Agregar assets/ si hay código de ejemplo

6. Ejecutar skill-sync
   └─ ./skills/skill-sync/assets/sync.sh

7. Actualizar AGENTS.md
   └─ Agregar skill a tabla de Available Skills
```

---

## Mejores Prácticas

### ✅ HACER

1. **Nombres descriptivos**: `prisma-repository` mejor que `db`
2. **Triggers específicos**: "Creando repositorios con Prisma"
3. **Ejemplos funcionales**: Código que compila y funciona
4. **Decision Trees**: Flujos de decisión claros
5. **Commands útiles**: Comandos que se usan frecuentemente

### ❌ NO HACER

1. **Skills duplicados**: No crear si ya existe
2. **Demasiado amplio**: Un skill no debe cubrir todo
3. **Sin ejemplos**: Siempre incluir código de ejemplo
4. **Triggers genéricos**: Ser específico en auto_invoke
5. **Documentar lo obvio**: No repetir documentación oficial

---

## Resources

- **Template**: [assets/SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md)
- **Ejemplos**: Ver otros skills en `skills/`
- **Sync**: Ejecutar `./skills/skill-sync/assets/sync.sh` después de crear
