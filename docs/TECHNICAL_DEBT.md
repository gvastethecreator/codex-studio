# Deuda técnica pendiente

Este documento enumera la deuda técnica que sigue siendo relevante tras la actualización actual.

## Alta prioridad

1. **Descomposición adicional de `components/AppContent.tsx`**
   - El componente ya delega bastante lógica a hooks y shells, pero todavía concentra demasiada composición de overlays, navegación y wiring entre contextos.
   - Próximo paso recomendado: seguir empujando wiring hacia `useStudioRuntime`, shells más pequeños y controladores de overlays más específicos.

2. **Migración completa del cache visual hacia consulta directa del catálogo**
   - La UI todavía persiste `GenerationBatch[]` en IndexedDB bajo `catalog-cache`, aunque SQLite/Image Catalog ya son la fuente duradera de verdad.
   - Próximo paso recomendado: cerrar la brecha descrita por ADR-0013, introducir superficies catalog-first y reducir el rol de `Visual Batch` a compatibilidad transitoria.

3. **Completar las costuras de inyección de dependencias en backend**
   - `appFactory.ts` ya admite seams útiles, pero módulos como `db`, `logger`, partes del worker y algunos flujos Codex siguen apoyándose en singletons/globales.
   - Próximo paso recomendado: extender ADR-0014 para habilitar tests aislados de catálogo, worker y lifecycle.

## Prioridad media

1. **Consolidación de naming entre Studio Runtime y Studio Readiness**
   - La documentación ya distingue ambos conceptos, pero el código todavía usa `studioRuntime.ts` y `useStudioRuntime.ts` para capas distintas (adapter vs orchestrator).
   - Próximo paso recomendado: evaluar si el hook agregado debe renombrarse o documentarse como superficie distinta antes de exponer más extensiones.

2. **Logging frontend uniforme**
   - Persisten usos directos de `console.*` en varios componentes y utilidades.
   - Próximo paso recomendado: introducir un adapter de logging compartido para UI con niveles y trazas más consistentes.

3. **Paridad total de animación en la capa GSAP local**
   - La nueva compatibilidad local desacopla la app de `motion/react`, pero todavía no replica toda la semántica de exit/layout animations.
   - Próximo paso recomendado: reforzar `AnimatePresence` para transiciones de salida complejas y listas animadas.

4. **Cobertura de tests de UI**
   - La suite unitaria ya corre con Vitest, pero el coverage del frontend visual sigue siendo modesto.
   - Próximo paso recomendado: agregar pruebas de integración de `Toolbar`, `QueuePanel`, `StudioPage` y `useLocalStudioSync`.

5. **Dependencias del stack**
   - Tras cada actualización mayor de Vite+, Rolldown u OXC conviene revisar compatibilidad real del repo y no asumir estabilidad total del ecosistema.
   - Próximo paso recomendado: revisar trimestralmente `bun outdated` y volver a ejecutar `validate:full`.

6. **Auditoría final de artefactos para release open source**
   - Ya se limpiaron `output/`, `tmp/` y `generated/`, y se purgó el historial de `*.png`, pero antes del release conviene revisar de nuevo que no reaparezcan prompts locales, muestras derivadas, cards PNG o archivos de trabajo con nombres/franquicias de terceros.
   - Próximo paso recomendado: ejecutar una revisión final de `git ls-files` y `git rev-list --objects --all` sobre artefactos locales para validar que el release candidate conserve únicamente las cards versionadas en `webp`.

## Prioridad baja

1. **Code splitting de recetas pesadas**
   - Las recetas más ricas todavía pueden beneficiarse de `React.lazy()` y separación de chunks.

2. **Guías adicionales del modelo catalog-first**
   - Cuando avance ADR-0013 hará falta documentar con más detalle cómo migrarán Workspaces, Vault y filtros cuando el grid consuma el catálogo sin `GenerationBatch[]`.
