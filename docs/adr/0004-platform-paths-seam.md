# ADR 0004: Platform Paths Seam

## Estado

Propuesto.

## Contexto

Actualmente existen paths hardcodeados para Windows y para la máquina específica del usuario `cristian` en múltiples archivos:

| Archivo              | Línea   | Path                                                                |
| -------------------- | ------- | ------------------------------------------------------------------- |
| `codexExecutable.ts` | 3-7     | `C:\Users\cristian\AppData\Roaming\npm\...\codex.exe` (4 variantes) |
| `codexClient.ts`     | 320     | `IMAGEGEN_SKILL_PATH = "C:\Users\cristian\.codex\skills\..."`       |
| `codexClient.ts`     | 301-304 | Regex de extracción que asume paths Windows (`[A-Z]:\\...`)         |
| `codexClient.ts`     | 417     | Instrucciones al developer con paths hardcodeados                   |

Esto viola el principio de locality: el conocimiento de dónde vive el binario de `codex` está disperso en 4 lugares. Si el usuario cambia, si Codex cambia su ruta de instalación, o si se quiere soportar macOS/Linux, hay que editar cada archivo individualmente.

**No hay seam** — no hay un lugar único donde cambiar el comportamiento de resolución de paths para toda la plataforma.

## Decisión

Crear un módulo `platformPaths.ts` con una interfaz única:

```ts
type PlatformPathKey =
  | 'codex-binary' // ruta al ejecutable codex
  | 'codex-skills-dir' // directorio de skills (~/.codex/skills)
  | 'codex-generated-images' // directorio de imágenes generadas (~/.codex/generated_images)
  | 'codex-config-dir'; // directorio de configuración (~/.codex)

function resolvePlatformPath(key: PlatformPathKey): string;
function getPlatformPathSeparator(): string;
```

### Implementación interna

Dos adapters internos, seleccionados por `process.platform`:

**Windows adapter** (existe hoy):

- `codex-binary`: intenta npm global → Windows App Store → PATH fallback.
- `codex-skills-dir`: `%USERPROFILE%\.codex\skills`.
- `codex-generated-images`: `%USERPROFILE%\.codex\generated_images`.
- `codex-config-dir`: `%USERPROFILE%\.codex`.

**Unix adapter** (futuro, macOS/Linux):

- `codex-binary`: `~/.local/share/npm/...` → `~/.local/bin/codex` → PATH fallback.
- `codex-skills-dir`: `~/.codex/skills`.
- `codex-generated-images`: `~/.codex/generated_images`.
- `codex-config-dir`: `~/.codex`.

### Implicación para image extraction

El regex de extracción de paths Windows-absolutos (`[A-Z]:\\...`) en `codexClient.ts` (función `extractSavedImagePathFromNotifications`) es un fallback de última instancia. La estrategia primaria (`extractGeneratedImageItemPath`) ya es platform-agnostic (usa `generated_images/{threadId}/{itemId}.png` relativo). La estrategia secundaria (`extractImageResultFromNotifications`) busca base64 inline, también agnóstica.

El regex Windows debe moverse detrás del adapter: `resolvePlatformPath('codex-generated-images')` da el directorio base, y la extracción busca paths hijos relativos. Si el notification contiene un path absoluto, se normaliza con el separador de la plataforma actual.

## Cambios archivo por archivo

### Crear

- **`apps/local-server/src/platformPaths.ts`** (~60 líneas) — `resolvePlatformPath()`, `getPlatformPathSeparator()`. Contiene ambos adapters internos.

### Editar

- **`apps/local-server/src/codexExecutable.ts`** — Reemplazar los 4 paths hardcodeados con `resolvePlatformPath('codex-binary')`. Este archivo podría fusionarse con `platformPaths.ts` o delegar completamente.
- **`apps/local-server/src/codexClient.ts`** — Línea 320: `IMAGEGEN_SKILL_PATH` → `resolvePlatformPath('codex-skills-dir') + '/imagegen.md'`. Líneas 301-304: el regex de path Windows se adapta para usar `getPlatformPathSeparator()` y el base dir de `codex-generated-images`. Línea 417: instrucciones usan `resolvePlatformPath('codex-generated-images')`.

### Eliminar

- **`apps/local-server/src/codexExecutable.ts`** — Si se fusiona completamente con `platformPaths.ts`.

## Consecuencias

### Positivas

- **Locality**: Todo el conocimiento de paths específicos de plataforma vive en un solo módulo. Agregar soporte Linux/macOS es agregar un adapter, no tocar 4 archivos.
- **Leverage**: Cualquier módulo que necesite resolver un path de Codex llama a `resolvePlatformPath(key)`. Si Codex cambia su estructura de directorios, se arregla en un solo lugar.
- **Deletion test**: Si borrás `platformPaths.ts`, la complejidad de resolver paths reaparece dispersa en `codexExecutable.ts`, `codexClient.ts`, y cualquier futuro módulo que necesite paths de Codex.
- **Tests**: Se puede testear el adapter Unix en cualquier plataforma (solo verifica shapes de paths). Se puede testear la resolución de `codex-binary` con un filesystem fake.

### Negativas

- Una capa de indirección más. Para un proyecto que hoy solo corre en Windows, el adapter Unix es una abstracción sin segundo adapter real. Sin embargo, el seam ya es necesario porque los paths están dispersos.

## Tests

```ts
// Adapter Windows
mock('process.platform', 'win32');
assert(resolvePlatformPath('codex-skills-dir').includes('.codex\\skills'));

// Adapter Unix
mock('process.platform', 'darwin');
assert(resolvePlatformPath('codex-skills-dir').includes('.codex/skills'));

// codex-binary fallback a PATH
mock('process.platform', 'linux');
// Si no existe en npm global ni ~/.local/bin, debe caer en 'codex'
assert(resolvePlatformPath('codex-binary') === 'codex');
```

## Riesgos

- Bajo para la extracción de paths. El cambio en el regex de extracción de imágenes requiere validación manual contra notifications reales de Codex para asegurar que el fallback Windows sigue funcionando.
