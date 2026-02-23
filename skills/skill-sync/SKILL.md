---
name: skill-sync
description: >
  Sincroniza metadata de skills a AGENTS.md.
  Trigger: Después de crear o modificar un skill, regenerar tablas Auto-invoke.
license: MIT
metadata:
  author: conasin-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Después de crear/modificar un skill|Regenerar tablas Auto-invoke de AGENTS.md"
allowed-tools: Read, Edit, Write, Bash
---

## When to Use

Usa esta skill cuando:
- Creas o modificas un skill
- Necesitas regenerar la tabla de Auto-invoke en AGENTS.md
- Cambias el metadata (auto_invoke, scope) de un skill

---

## Commands

```bash
# Sincronizar skills con AGENTS.md
./skills/skill-sync/assets/sync.sh

# Modo dry-run (ver cambios sin aplicar)
./skills/skill-sync/assets/sync.sh --dry-run

# Mostrar ayuda
./skills/skill-sync/assets/sync.sh --help
```

---

## Qué Hace

1. Lee todos los `SKILL.md` en `skills/`
2. Extrae el frontmatter (metadata)
3. Genera la sección "Auto-invoke Skills" en AGENTS.md
4. Crea tabla con acción → skill

---

## Estructura de Frontmatter Requerida

```yaml
---
name: {skill-name}
description: >
  {descripción}
  Trigger: {cuándo usar}
metadata:
  author: {autor}
  version: "{versión}"
  scope: [root]           # Ámbito de aplicación
  auto_invoke: "{acción}" # Acción que dispara el skill
---
```

### Auto-invoke

Puede ser una acción única:
```yaml
auto_invoke: "Creando schemas Zod"
```

O múltiples acciones separadas por `|`:
```yaml
auto_invoke: "Después de crear/modificar un skill|Regenerar tablas Auto-invoke de AGENTS.md"
```

---

## Flujo de Trabajo

```
1. Crear/modificar skill
   └─ Editar skills/{skill}/SKILL.md

2. Ejecutar sync
   └─ ./skills/skill-sync/assets/sync.sh

3. Verificar AGENTS.md
   └─ Revisar sección "Auto-invoke Skills"
```

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Skill no aparece en tabla | Falta `auto_invoke` en metadata | Agregar al frontmatter |
| Acción duplicada | Mismo auto_invoke en varios skills | Cambiar descripción de acción |
| Tabla vacía | No hay skills con auto_invoke | Agregar metadata a skills |

---

## Resources

- **Script**: [assets/sync.sh](assets/sync.sh)
- **Template SKILL**: Ver [skill-creator/assets/SKILL-TEMPLATE.md](../skill-creator/assets/SKILL-TEMPLATE.md)
