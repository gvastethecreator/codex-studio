# Política de seguridad

## Versiones soportadas

Codex Studio está en etapa de preview open-source. Los fixes de seguridad se aplican sobre la rama principal mientras no existan releases estables.

## Reporte de vulnerabilidades

No abras issues públicos para vulnerabilidades que involucren archivos locales, credenciales, Provider Secrets o exposición de assets.

Reporta por canal privado del mantenedor e incluye:

- commit o versión afectada
- sistema operativo
- pasos para reproducir
- impacto esperado/observado
- logs saneados (sin secretos)

## Notas de seguridad local-first

- Los secretos de proveedor deben permanecer fuera de Studio Settings persistidos en SQLite.
- Nunca commitees `.env.local`, bases SQLite, logs, transcripts ni carpetas de librería local.
- Trata las rutas de Studio Library como datos controlados por usuario.
- Evita operaciones destructivas sobre rutas arbitrarias: registra/importa External Output Sources primero.
