# Contribuir a Codex Image Studio

Gracias por ayudar a convertir este repo en un producto open-source mas solido y mas facil de instalar.

## Antes de abrir una PR

- Revisa el contexto del producto en `README.md` y `ROADMAP.md`.
- Si tu cambio toca arquitectura o sincronizacion local, mira tambien `docs/ARCHITECTURE.md` y `docs/SERVICES.md`.
- Si agregas o modificas una receta, revisa `docs/DEV_GUIDE.md`.

## Setup local recomendado

```bash
bun install
bun run studio:init
bun run dev
```

Si prefieres separar procesos:

```bash
bun run dev:server
bun run dev:ui
```

## Requisitos para contribuir bien

- Tener **Bun** disponible en PATH.
- Tener **Codex CLI** instalado y autenticado localmente.
- No depender de API keys para el flujo principal del producto.

## Checklist minima para cambios de codigo

Antes de abrir una PR, intenta dejar esto en verde:

```bash
bun run fmt:check
bun run lint
bun run check
bun run test
bun run build
```

Si tu cambio toca onboarding, setup o DX, actualiza la documentacion correspondiente en la misma PR.

## Convenciones importantes del repo

- No subir assets generados, logs, bases SQLite ni contenido de la biblioteca local.
- No commitear `.env.local`, `.env` con datos reales ni rutas especificas de tu maquina.
- Mantener la UI local-first: la experiencia principal debe seguir funcionando sin `OPENAI_API_KEY`.
- Si agregas una nueva variable de entorno o script publico, documentalo en `README.md`.
- Si cambias una decision estructural relevante, deja evidencia en `docs/adr/` o al menos en la documentacion tecnica afectada.
- Las tareas de calidad principales deben seguir escribiendo logs en `logs/tooling/`.
- Las nuevas pruebas unitarias deben escribirse con `vite-plus/test`.

## Como reportar bugs utiles

Cuando abras un issue o describas un problema, incluye:

- sistema operativo;
- version de Bun;
- version de Codex (`codex --version`);
- version de Bun (`bun --version`);
- comando usado (`bun run dev`, `bun run dev:server`, etc.);
- que esperabas que ocurriera;
- que ocurrio realmente;
- logs o capturas relevantes de `D:\AI-Studio-Library\logs`, `logs/tooling/` o de tu directorio equivalente.

## Cambios especialmente valiosos ahora mismo

Durante esta etapa de preparacion open-source, ayudan mucho las PRs que mejoren:

- onboarding y mensajes de error;
- compatibilidad Windows/macOS/Linux;
- trazabilidad de jobs y assets;
- documentacion publica;
- limpieza de copy, naming y affordances de la UI.

## Estilo de contribucion

Preferimos cambios pequeños, explicables y faciles de validar. Si vas a hacer una limpieza grande o una reorganizacion fuerte, abre primero una issue o deja una nota de enfoque para alinear la direccion. Menos heroics, mas claridad.
