# ADR 0015: Extract 3D Viewport from CameraAnglesRecipe into a Reusable Module

## Estado

Propuesto.

## Contexto

`CameraAnglesRecipe.tsx` tiene **904 líneas**, de las cuales aproximadamente **500 líneas** (55%) son código imperativo de THREE.js para un viewport 3D interactivo. La receta mezcla dos concerns fundamentalmente distintos:

### Concern 1: Configuración de receta (~400 líneas)
- Selectores de shot type (9 tipos de plano)
- Construcción de prompt con datos de cámara 3D
- Galería de imágenes generadas con ángulos de cámara
- Interfaz de usuario de la receta (controles, previews)

### Concern 2: Viewport 3D con THREE.js (~500 líneas)
Implementado enteramente en un `useEffect` de ~500 líneas:
- Construcción de escena: `Scene`, `Camera`, `Renderer`, luces, materiales
- Geometría procedural: polar grid (círculos concéntricos + líneas radiales), modelo de cámara 3D (body + lens), frustum wireframe, ray desde la cámara al target, handles de posición
- Texturas procedurales: grid texture (canvas 2D generado en runtime), gradient textures para fondo
- Interacción: mouse drag para órbita (azimuth/elevación), wheel para zoom (distancia), coordenadas esféricas → Cartesianas
- Animation loop: `requestAnimationFrame` con renderizado continuo
- ResizeObserver: redimensionar canvas y cámara al cambiar el tamaño del contenedor
- Cleanup: dispose de geometrías, materiales, renderer, y cancelar animation frame

Si otra receta necesita un viewport 3D (ej. para previsualizar iluminación, poses de personajes, o composición de escena), tendría que copiar ~500 líneas de código THREE.js imperativo.

### Deletion test

Si extraemos el viewport 3D a un módulo reutilizable:
- La complejidad de THREE.js (scene setup, orbit controls, animation loop, cleanup) se concentra en un hook o clase.
- `CameraAnglesRecipe` se reduce a ~400 líneas de pura lógica de receta.
- Una futura receta que necesite 3D importa el módulo, no copia 500 líneas.

## Decisión

### Extraer `useCameraViewport` hook

Interfaz:

```ts
interface CameraViewportConfig {
  /** Distancia inicial de la cámara al target */
  initialDistance?: number
  /** Azimuth inicial en radianes */
  initialAzimuth?: number
  /** Elevación inicial en radianes */
  initialElevation?: number
  /** Límites de distancia [min, max] */
  distanceRange?: [number, number]
  /** Límites de elevación [min, max] en radianes */
  elevationRange?: [number, number]
  /** Escena personalizada (geometrías, luces) — se mergea con la escena base */
  customScene?: (scene: THREE.Scene) => void | (() => void)  // cleanup opcional
  /** Callback cuando cambia el estado de cámara */
  onCameraChange?: (state: CameraState) => void
}

interface CameraState {
  azimuth: number
  elevation: number
  distance: number
  /** Posición de la cámara en coordenadas mundiales */
  cameraPosition: { x: number; y: number; z: number }
  /** Punto al que mira la cámara */
  target: { x: number; y: number; z: number }
}

function useCameraViewport(
  containerRef: RefObject<HTMLDivElement>,
  config?: CameraViewportConfig
): {
  cameraState: CameraState
  /** Re-export para casos donde el caller necesita acceso directo a THREE */
  scene: THREE.Scene | null
  /** Forzar resize (ej. después de cambiar el tamaño del contenedor programáticamente) */
  resize: () => void
}
```

El hook maneja internamente:
- Creación/destrucción de `Scene`, `PerspectiveCamera`, `WebGLRenderer`
- Orbit controls (mouse drag + wheel) con límites configurables
- Animation loop con `requestAnimationFrame`
- ResizeObserver en el container
- Cleanup completo en unmount
- Escena base (polar grid, luces, fondo) — opcionalmente extendible vía `customScene`

### Uso en CameraAnglesRecipe

```tsx
function CameraAnglesRecipe({ config, onGenerate, ... }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { cameraState } = useCameraViewport(containerRef, {
    initialDistance: 5,
    distanceRange: [2, 20],
    elevationRange: [-Math.PI / 3, Math.PI / 3],
    customScene: (scene) => {
      // Solo la geometría específica de cámara (camera model, frustum, ray, handles)
      const cameraModel = createCameraModel()
      const frustum = createFrustumWireframe()
      scene.add(cameraModel, frustum)
      return () => { cameraModel.dispose(); frustum.dispose() }
    },
    onCameraChange: (state) => {
      // Actualizar prompt con datos de cámara
      updateCameraParams(state)
    },
  })

  return (
    <div ref={containerRef} className="camera-viewport">
      {/* El canvas se crea dentro del hook */}
    </div>
  )
}
```

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `hooks/useCameraViewport.ts` | Nuevo — hook de viewport 3D con THREE.js |
| `components/recipes/CameraAnglesRecipe.tsx` | Reducción de 904 → ~450 líneas |
| `components/recipes/cameraAngles/cameraModel.ts` | Nuevo — geometría del modelo de cámara (extraído del recipe) |
| `components/recipes/cameraAngles/sceneSetup.ts` | Nuevo — `customScene` callback (polar grid + cámara model) |

## Consecuencias

### Positivas

- **Locality**: Un bug en los orbit controls (ej. gimbal lock en los polos) se diagnostica y arregla en `useCameraViewport.ts`. Hoy está enterrado en un `useEffect` de 500 líneas dentro de un componente de receta.
- **Leverage**: `useCameraViewport` es un módulo deep — interfaz de 3 opciones de configuración, implementación de ~300 líneas de THREE.js, ResizeObserver, animation loop, y cleanup. Una receta futura lo usa con 5 líneas de configuración.
- **Testability**: `useCameraViewport` es testeable con un canvas mock (jsdom + three.js). La lógica de receta de `CameraAnglesRecipe` (construcción de prompt, shot type selection) es testeable sin THREE.js.
- **Reusabilidad**: Una receta de "iluminación 3D", "poses de personaje", o "composición de escena" puede usar el mismo viewport.
- **Bundle size**: Si `useCameraViewport` se carga con `React.lazy`, THREE.js solo se descarga cuando una receta que usa 3D está activa. Hoy THREE.js se carga siempre que `CameraAnglesRecipe` está en el bundle.

### Negativas

- **Abstracción incompleta**: THREE.js es inherentemente imperativo. El hook abstrae los controles de cámara pero el `customScene` callback expone la API de THREE directamente. Esto es necesario para flexibilidad pero rompe la abstracción parcialmente.
- **Un solo adapter actual**: Solo `CameraAnglesRecipe` usa el viewport 3D. Es un hypothetical seam hasta que una segunda receta lo use. Sin embargo, el beneficio de locality (separar 3D de lógica de receta) justifica la extracción incluso con un solo consumidor.

### Riesgo

**Bajo**. Es una extracción mecánica: mover código de un `useEffect` a un hook, parametrizar lo que varía entre usos. El componente `CameraAnglesRecipe` se simplifica significativamente. La funcionalidad 3D no cambia — solo cambia dónde vive.

### Dependencias

- **ADR 0011** (AppContent decomposition): Si `RecipePage` carga recetas con `React.lazy`, `useCameraViewport` (y THREE.js) se code-splittean automáticamente.
- **ADR 0012** (RecipeContextBuilder): La construcción del prompt con datos de cámara se beneficiaría de un builder estandarizado en lugar de construirlo inline.
