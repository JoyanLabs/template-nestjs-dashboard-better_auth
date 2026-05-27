# Referencias a Documentación del Proyecto

Este skill mantiene la consistencia entre documentación técnica (docs/) y skills de IA (skills/).

## Principio Clave

**TODO documento en docs/ DEBE estar asociado a un skill.**

## Mapeo Docs-Skills

| Documento | Skill Asociado | Tipo | Prioridad |
|-----------|----------------|------|-----------|
| ARCHITECTURE.md | template-backend | Arquitectura | Alta |
| SETUP.md | template-backend | Guía inicio | Media |

## Convenciones

### Al crear un nuevo documento:

1. **Verificar que no existe**
   ```bash
   grep -r "{tema}" docs/
   ```

2. **Identificar skill relacionado**
   - Funcionalidad específica → Skill del contexto
   - Patrón/arquitectura → nestjs/template-backend
   - Integración externa → Skill del servicio
   - Operaciones/DevOps → template-backend

3. **Agregar referencia en skill**
   En `skills/{skill}/SKILL.md` agregar a sección Resources:
   ```markdown
   - **[{Título}](../../docs/{archivo}.md)** - {Descripción}
   ```

4. **Actualizar este archivo**
   Agregar entrada a la tabla de mapeo.

5. **Ejecutar skill-sync**
   ```bash
   ./skills/skill-sync/assets/sync.sh
   ```

### Estructura de referencias en skills

Cada skill que tenga documentación asociada debe incluir en su SKILL.md:

```markdown
## Resources

- **Documentación**: Ver [docs/{archivo}.md](../../docs/{archivo}.md) para guía completa
- **Patrones de Código**: Ver [assets/](assets/) para ejemplos copy-pasteable
```

## Formato de Fechas

Todos los documentos deben usar: `YYYY-MM-DD`

Ejemplo correcto: `2026-05-27`

## Tamaño Máximo

Documentos > 15KB deben dividirse o consolidarse.

Verificar con:
```bash
ls -lh docs/*.md | awk '{print $5, $9}'
```