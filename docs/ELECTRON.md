# Electron: dirección propuesta

Este documento no anuncia un release inmediato de Electron. Define una estrategia gradual para soporte desktop sin acoplar el renderer a APIs de escritorio.

## Estado actual

El flujo principal sigue siendo UI React/Vite + backend local Bun/Hono por HTTP.

El seam clave es `Studio Runtime`: el renderer resuelve `apiBase` dinámicamente (`window.codexStudio?.apiBase` → `VITE_STUDIO_API_BASE` → localhost por defecto).

## Ruta rápida

1. `bun run dev:electron` para validar shell desktop en desarrollo.
2. `bun run preview:electron` para probar carga de build local.
3. Mantener la app web como camino principal mientras se consolida runtime.

## Línea base de seguridad

- `BrowserWindow` con `preload` explícito.
- `nodeIntegration: false`.
- `contextIsolation: true`.
- `sandbox: true` cuando sea viable.
- Exponer sólo wrappers mínimos vía `contextBridge`.
- Bloquear navegación inesperada y aperturas arbitrarias.

## Fricción real

La complejidad no es abrir una ventana Electron: es empaquetar correctamente el backend local (Bun + `codex app-server`) dentro de distribución desktop.

## Estrategia por fases

| Fase | Objetivo                                               |
| ---- | ------------------------------------------------------ |
| 1    | Renderer preparado (seam runtime estable)              |
| 2    | Adaptador desktop mínimo (`main` + `preload`)          |
| 3    | Empaquetado serio (Bun embebido o runtime alternativo) |

## Decisión práctica actual

- No intentar release final de Electron todavía.
- Sí consolidar runtime/onboarding y desacoplar renderer.
- Tratar Electron como adaptador futuro, no como reescritura.

## Checklist previo a distribución desktop

- [ ] Definir empaquetado/supervisión de Bun.
- [ ] Validar comportamiento de `codex app-server` en app distribuida.
- [ ] Revisar rutas de Studio Library por SO.
- [ ] Definir canal de health/logs entre main, preload y renderer.
