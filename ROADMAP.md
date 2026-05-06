# Roadmap

Este roadmap describe la direccion del producto mientras preparamos una version open-source mas madura. No es un contrato cerrado; es una guia de prioridades.

## Principios

- **Local-first**: el studio debe seguir siendo util sin backend cloud propio.
- **Codex-native**: la integracion principal gira alrededor de `codex app-server` y la sesion autenticada del usuario.
- **Trazable**: cada job debe dejar logs, estado y artefactos inspeccionables.
- **Portable**: la biblioteca local debe poder moverse o reconfigurarse sin reescribir el producto.

## Ahora

- Mejorar onboarding para usuarios nuevos de Codex Image Studio.
- Pulir README, troubleshooting y documentacion de contribucion.
- Reducir lenguaje y affordances demasiado internos en la UI.
- Hacer mas clara la separacion entre UI, backend local y biblioteca externa.
- Fortalecer el flujo de salud inicial: Codex CLI, `app-server`, puertos y biblioteca.

## Proximo bloque

- Mejor setup cross-platform para rutas y configuracion local.
- Mensajes de error y recovery mas claros cuando Codex no esta disponible.
- Mejor visualizacion de jobs persistentes, activity feed y logs.
- Edicion de imagenes y referencias con trazabilidad consistente.
- Mejor import/export de workspaces y biblioteca local.
- Definir el camino desktop sin romper el Studio Runtime ni acoplar el renderer a APIs de Electron.

## Mas adelante

- Empaquetado o distribucion mas simple para usuarios no tecnicos.
- Explorar una build Electron segura con `preload`, `contextBridge` y supervision del backend local.
- Mejor exploracion historica de assets, transcripts y ejecuciones.
- Utilidades de auditoria y mantenimiento de la biblioteca local.
- Superficies mas claras para extensiones, recetas y adapters futuros.

## No objetivos inmediatos

- Convertir el producto en un servicio cloud administrado.
- Reintroducir dependencias obligatorias de API keys para el camino principal.
- Publicarlo como paquete npm reutilizable; el foco es el studio local, no una libreria.
