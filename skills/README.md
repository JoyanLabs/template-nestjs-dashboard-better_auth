# AI Skills

Este directorio contiene skills para asistentes de IA siguiendo el estándar de agentskills.io.

## Estructura

```
skills/
├── setup.sh              # Configura los skills para tu AI assistant
├── README.md             # Este archivo
├── {skill-name}/
│   ├── SKILL.md          # Archivo principal del skill
│   ├── assets/           # Código de ejemplo, templates
│   └── references/       # Documentación de referencia
```

## Configuración

Ejecuta el script de setup para configurar los skills:

```bash
./skills/setup.sh
```

Opciones disponibles:
- `--all`: Configura todos los AI assistants
- `--opencode`: Solo OpenCode
- `--claude`: Solo Claude Code
- `--help`: Muestra ayuda

## Skills Disponibles

### Core
- **template-backend**: Overview y navegación del proyecto
- **nestjs**: Arquitectura hexagonal y CQRS
- **better-auth**: Integración con Better Auth
- **prisma**: Patrones de base de datos
- **inngest**: Tareas asíncronas
- **auth-guards**: Guards y permisos avanzados
- **prisma-repository**: Patrón repositorio con interfaces
- **vitest-testing**: Patrones de testing con Vitest

### Utilidades
- **git-guidelines**: Commits y PRs
- **zod-4**: Validación de schemas
- **typescript**: Tipos y patterns
- **context7-docs**: Documentación externa

### Meta
- **skill-creator**: Crear nuevos skills
- **skill-sync**: Sincronizar AGENTS.md

## Crear Nuevo Skill

1. Leer `skills/skill-creator/SKILL.md`
2. Usar el template en `skills/skill-creator/assets/SKILL-TEMPLATE.md`
3. Ejecutar `./skills/setup.sh` para actualizar

## Actualizar Skills

Después de modificar cualquier skill:

```bash
./skills/skill-sync/assets/sync.sh
```

Esto actualiza la sección "Auto-invoke" en AGENTS.md.

---

**Nota**: AGENTS.md es la fuente de la verdad. Modifícalo directamente, luego ejecuta setup.sh.
