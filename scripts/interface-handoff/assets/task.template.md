# Tarea única: integración Interface Handoff

Crear solo si no existe. Es una tarea interna del agente: implementarla inmediatamente
en la misma invocación. En actualizaciones, conservarla y registrar adaptaciones necesarias al workflow y el resultado.
No exigir aprobación adicional ni duplicar tareas de instalación.

Estado: planned | in_progress | blocked | implemented | verified

## Baseline y objetivo
Proyecto / commit / working tree / fecha / instrucciones del proyecto.
Qué UI se exporta y qué review debe habilitar. Alcance total o parcial e inventario base.

## Observado / desconocido / preservar
Framework y versión instalada, gestor, routing, estilos, providers, pruebas.
Restricciones y decisiones reales. No atribuir aprobaciones no documentadas.

## Estrategia elegida
Target: file preferido / localhost justificado / evidence-only parcial.
UI reutilizada, fronteras de IO, fixtures, escenarios y exclusiones.
Motivo de elección y alternativas descartadas con evidencia.

## Reconciliación con el proyecto actual
Export_id previo / inventario actual / vistas-estados agregados, retirados o movidos.
Cambios de contratos, estilos, arquitectura y dependencias fuera de raíces antiguas.
Adaptaciones necesarias al exporter, workflow, mocks, fixtures, pruebas y contexto.
Impacto sobre caché/evidencia, validación pendiente y referencias obsoletas que retirar.

## Cambios por archivo
Ruta real | cambio | razón | riesgo | prueba.
Nombres propuestos se marcan como propuestos hasta crearlos.

## Secuencia de implementación
1. Inventario y baseline comparable con datos seguros.
2. Entrypoint de review y adapters sin efectos de producción.
3. Escenarios, navegación, flujos y reset.
4. Build, índice y contexto desde una misma versión.
5. Pruebas, privacidad, empaquetado y extracción limpia.
6. Documentación, comando repetible y receipt de entrega.

## Criterios de aceptación
- [ ] No hay reinterpretación visual ni bypass de auth de producción.
- [ ] Cada vista/estado incluido se localiza y reproduce.
- [ ] Acciones relevantes operan sobre estado coherente o declaran su indisponibilidad.
- [ ] Se cumple y prueba el target de portabilidad solicitado.
- [ ] Contexto, cobertura, fuentes, diferencias y límites están completos.
- [ ] Evidencia vinculada a export_id y condiciones reales de captura.
- [ ] Paquete por allowlist, sin secretos/PII ni dependencias del checkout.
- [ ] ZIP extraído en otra carpeta, probado y verificable.
- [ ] Comando único implementado: detecta estado/caché y termina en ZIP.
- [ ] Configuración y baseline persistidos; no reemplazados ante fallos.
- [ ] Segunda invocación reutiliza integración sin volver a pedir modos.
- [ ] Cambios locales, altas/bajas e invalidación global detectados.
- [ ] Evidencia reutilizada tiene procedencia; gates mínimos ejecutados de nuevo.

- [ ] Inventario contrastado con fuentes/router/runtime actuales, no copiado del ZIP viejo.
- [ ] Scripts, entrypoints, mocks, fixtures y workflow adaptados a contratos actuales.
- [ ] Descubrimiento fuera de raíces previas revisado; dependencias relevantes incorporadas.
- [ ] Rutas/estados retirados no aparecen en el nuevo paquete; no se borró trabajo ajeno.
- [ ] Informe de reconciliación vigente y sin diferencias pendientes antes del snapshot.
- [ ] Manifiesto y copia de inventario coinciden en vistas, estados, entradas y fuentes.
- [ ] Fidelidad comparada contra producto actual; sin original observable, no verificada.

## Pruebas ejecutadas
Comando/pasos | entorno | pass/failed/not_run | evidencia | limitaciones.

## Rollback y entrega
Cómo revertir solo esta integración sin tocar cambios previos del usuario.
Archivos modificados, comando real, ZIP, pendientes, diferencias frente al plan.

## Recepción agent-ready (v0.4)

- [ ] Brief actual inspeccionado; AGENTS.md exclusivo del ZIP, sin copiar reglas de desarrollo.
- [ ] Índice de archivos, plan completo y schema/contrato de review incluidos.
- [ ] ZIP + brief lateral con mismo export_id entregados sin pasos para el usuario.
- [ ] Human-ready solo si fue solicitado; guía adicional del mismo snapshot.
- [ ] Smoke sin repo, enlaces, frescura y capability fallback verificados/documentados.
