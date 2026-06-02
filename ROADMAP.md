# Hoja de ruta

Esta hoja de ruta define la dirección del producto mientras Codex Studio se prepara para una preview open-source más sólida.

## Ruta rápida

1. Consolidar shell y experiencia de primer uso.
2. Completar transición catalog-first.
3. Fortalecer operabilidad (diagnóstico + jobs + recuperación).
4. Cerrar brecha de portabilidad y estrategia desktop.
5. Publicar un release candidate presentable.

## Estado actual

Codex Studio ya está alineado en pilares clave:

- **Local-first**: estado, assets y logs viven en una Studio Library local.
- **Codex-first**: flujo principal vía `codex app-server`.
- **Trazable**: jobs, eventos, transcripts y catálogo permiten inspección real.
- **Portable**: la librería está separada del repo y es configurable.
- **Extensible**: `Generation Task` y `Generation Provider` son conceptos separados.

## Fases

| Fase | Objetivo                        | Resultado esperado                        |
| ---- | ------------------------------- | ----------------------------------------- |
| 0    | Estabilizar shell actual        | Navegación y estados globales más claros  |
| 1    | Cerrar transición catalog-first | UI alineada con SQLite/Image Catalog      |
| 2    | Mejorar operabilidad            | Fallos comunes con diagnóstico accionable |
| 3    | Setup y portabilidad            | Instalación más simple en Win/macOS/Linux |
| 4    | Release candidate OSS           | Repo listo para exposición pública        |

## Prioridades cercanas

- Mejorar onboarding y mensajes de error.
- Reforzar recuperación y detalle de jobs.
- Reducir deuda de orquestación en shell.
- Mantener calidad con `validate:fast` y `validate:full`.

## Checklist de salida para release candidate

- [ ] Instalación reproducible en máquinas nuevas.
- [ ] Diagnóstico básico disponible desde UI.
- [ ] Documentación de setup, troubleshooting y contribución alineada.
- [ ] Sin artefactos sensibles/versionados por error (DBs, logs, assets locales, secretos).

## No-objetivos (por ahora)

- Convertirlo en SaaS multiusuario.
- Hacer API keys obligatorias para el flujo principal.
- Empaquetar como librería npm reutilizable.

## Próximo paso

Usar este documento junto con `docs/active/professionalization-roadmap.md` para priorizar slices semanales.
