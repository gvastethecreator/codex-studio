# Guía de contribución para Codex Studio

Gracias por ayudar a convertir este repo en un proyecto open-source más robusto, claro e instalable.

## Ruta rápida para contribuir

1. Lee `README.md` y `ROADMAP.md`.
2. Levanta el entorno local con `bun run studio:init` + `bun run dev`.
3. Haz un cambio pequeño, validable y con contexto.
4. Corre checks mínimos antes del PR.

## Setup recomendado

```bash
bun install
bun run studio:init
bun run dev
```

Opcional por separado:

```bash
bun run dev:server
bun run dev:ui
```

## Requisitos

- Bun disponible en PATH.
- Codex CLI instalado y autenticado localmente.
- No depender de API keys para el flujo principal.

## Checklist antes de abrir PR

```bash
bun run fmt:check
bun run lint
bun run check
bun run test
bun run build
```

## Convenciones importantes

- No commitear assets generados, logs, DBs SQLite ni contenido local de librería.
- No commitear `.env.local` ni secretos reales.
- Mantener experiencia local-first funcional sin `OPENAI_API_KEY`.
- Documentar variables nuevas y scripts públicos en `README.md`.
- Si cambias decisiones estructurales, deja rastro en `docs/adr/`.

## Cómo reportar bugs útiles

Incluye:

- SO
- versión de Bun (`bun --version`)
- versión de Codex (`codex --version`)
- comando ejecutado
- resultado esperado vs real
- logs relevantes (`logs/tooling/` o logs de Studio Library)

## Qué aportes tienen más impacto hoy

- onboarding y mensajes de error
- compatibilidad Windows/macOS/Linux
- trazabilidad de jobs y assets
- documentación pública
- claridad de copy/UX en la UI

## Estilo de contribución

Preferimos cambios pequeños, explicables y fáciles de verificar. Menos heroicidad; más claridad.

## Código de conducta

Este proyecto sigue [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
