---
name: context7-docs
description: >
  Consulta documentación actualizada de librerías vía Context7 MCP.
  Trigger: Buscando documentación o buenas prácticas de librerías externas.
license: MIT
metadata:
  author: template-team
  version: "1.0"
  scope: [root]
  auto_invoke: "Buscando documentación o buenas prácticas"
allowed-tools: Read, Edit, Write, Bash
---

## When to Use

Usa esta skill cuando:
- Necesitas documentación actualizada de una librería
- Quieres ejemplos específicos de una API
- Buscas mejores prácticas de una tecnología

---

## Commands

```bash
# Resolver ID de librería
mcp context7 resolve-library-id \
  --query "nestjs framework" \
  --libraryName "nestjs"

# Consultar documentación
mcp context7 query-docs \
  --libraryId "/nestjs/docs.nestjs.com" \
  --query "cómo crear un middleware"
```

---

## Library IDs Comunes

| Librería | Context7 ID |
|----------|-------------|
| NestJS | `/nestjs/docs.nestjs.com` |
| Prisma | `/prisma/docs` |
| Better Auth | `/llmstxt/better-auth_llms_txt` |
| Inngest | `/llmstxt/inngest_llms-full_txt` |

---

## Resources

- **Context7**: https://context7.com/
