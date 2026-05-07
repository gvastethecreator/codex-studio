# Deuda técnica pendiente

Este documento enumera la deuda técnica que sigue siendo relevante tras la actualización actual.

## Alta prioridad

1. **Decomposición de `components/AppContent.tsx`**
   - Sigue concentrando demasiada orquestación visual, routing interno y overlay management.
   - Próximo paso recomendado: extraer módulos tipo `StudioShell`, `RecipeShell` y `OverlayController`.

2. **Migración completa del modelo visual hacia el catálogo**
   - La UI aún mantiene compatibilidad con `GenerationBatch` aunque SQLite/Catalog ya es la fuente duradera.
   - Próximo paso recomendado: cerrar la brecha descrita por ADR-0013 y reducir dependencia de IndexedDB para batches.

3. **Logging frontend uniforme**
   - Persisten usos directos de `console.*` en varios componentes y utilidades.
   - Próximo paso recomendado: introducir un adapter de logging compartido para UI con niveles y trazas más consistentes.

## Prioridad media

1. **Paridad total de animación en la capa GSAP local**
   - La nueva compatibilidad local desacopla la app de `motion/react`, pero todavía no replica toda la semántica de exit/layout animations.
   - Próximo paso recomendado: reforzar `AnimatePresence` para transiciones de salida complejas y listas animadas.

2. **Cobertura de tests de UI**
   - La suite unitaria ya corre con Vitest, pero el coverage del frontend visual sigue siendo modesto.
   - Próximo paso recomendado: agregar pruebas de integración de `Toolbar`, `QueuePanel`, `StudioPage` y `useLocalStudioSync`.

3. **Dependencias del stack**
   - Tras cada actualización mayor de Vite+, Rolldown u OXC conviene revisar compatibilidad real del repo y no asumir estabilidad total del ecosistema.
   - Próximo paso recomendado: revisar trimestralmente `bun outdated` y volver a ejecutar `validate:full`.

4. **Auditoría final de artefactos para release open source**
   - Ya se limpiaron `output/`, `tmp/` y `generated/`, y se purgó el historial de `*.png`, pero antes del release conviene revisar de nuevo que no reaparezcan prompts locales, muestras derivadas, cards PNG o archivos de trabajo con nombres/franquicias de terceros.
   - Próximo paso recomendado: ejecutar una revisión final de `git ls-files` y `git rev-list --objects --all` sobre artefactos locales para validar que el release candidate conserve únicamente las cards versionadas en `webp`.

## Prioridad baja

1. **Code splitting de recetas pesadas**
   - Las recetas más ricas todavía pueden beneficiarse de `React.lazy()` y separación de chunks.

2. **Guías adicionales de arquitectura**
   - Sería útil documentar explícitamente el roadmap de transición entre cache visual legacy e indexación definitiva en catálogo.
