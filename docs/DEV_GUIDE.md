# Guía de Desarrollo y Extensión (Developer Guide)

Este documento contiene las reglas, convenciones e instrucciones para entender el código fuente o contribuir al proyecto.

## 1. Convenciones del Proyecto

- **Strict Typing:** Prohibido usar `any`. Cada interfaz consumida debe contar con Type Check definido en `/types.ts`.
- **Barrel Imports:** Aconsejable centralizar los exports pero para utilidades referir al path específico y evitar circularidad.
- **Imports Locales y Tooling:** Cargar las definiciones UI siempre en `components/ui/` y las utilidades `utils/`.
- **Toolchain Unificado:** La UI se valida y construye con **Vite+**. Usa `bun run check`, `bun run test` y `bun run build` como comandos principales; evita reintroducir configuraciones separadas de ESLint, Prettier o Vitest fuera de `vite.config.ts`.
- **Animación:** El proyecto usa **GSAP** para animaciones React. No reintroducir `motion/react` ni otras capas de animación similares.
- **Tests:** Las pruebas unitarias deben importar helpers desde `vite-plus/test`.

## 2. Creando una Nueva "Receta" (Recipe)

El sistema de recetas es completamente modular. Si deseas agregar una nueva, por ejemplo "Pixel Art Recipe", sigue estos pasos:

1. **Crear el Componente Principal:** Archivo en `/components/recipes/PixelArtRecipe.tsx`. Usa el `RecipeLayout` para acoplarte al diseño estándar y heredar el estilo, toolbar secundario y el área de previsualización de imágenes; esto proporciona consistencia UI en toda la app.

   ```tsx
   import { RecipeLayout } from './RecipeLayout';

   export const PixelArtRecipe = () => {
      return (
         <RecipeLayout isGenerating={false} onGenerate={...} title="Pixel Art Studio">
            {/* UI specific controls for Pixel Art */}
         </RecipeLayout>
      );
   };
   ```

2. **Definir Controles de Usuario:** Añadir controles utilizando el componente reutilizable `ControlDropdown` para inyectar preferencias de usuario en parámetros visuales, por ejemplo paleta de colores, tamaños de pixel o dither.

3. **Inyectar la lógica en la barra principal (Opcional):** Si tu receta usa `promptEnhancerService` u otro contexto, asegúrate de conectarla con el global state (`generationConfig`, etc.).

4. **Registrar la Ruta:** En `components/RecipeRouter.tsx` y en el menú de navegación (`SidePanel.tsx`), agrega el ID que corresponderá a la URL generada (`#recipe-pixelart`).

## 3. Trabajo con IndexedDB (IDB)

Todo lo que sea estado mutado persistente, como configuraciones extra para la nueva receta que desees que el usuario no pierda al dar F5, debe guardarse mediante nuestro motor envuelto en promesas expuesto en `/utils/idb.ts`.

## 4. Lineamientos de Estilo (Styling Guidelines)

- Utiliza **Tailwind CSS v4** mediante las directivas actualizadas. Mantén a rajatabla la paleta central impuesta en `DESIGN.md`.
- Los tokens visuales compartidos, como color, tipografía, easing y animaciones base, deben vivir en `index.css` mediante `@theme` y variables CSS antes de abrir un nuevo archivo de estilos.
- Iconografía: únicamente íconos de la librería `lucide-react`.

## 5. Rendimiento y Carga de Componentes

Si planeas agregar dependencias masivas o modelos local-first (LLM in browser):

- Configura code splitting empleando `React.lazy()` y `Suspense` dentro de las transiciones grandes en lugar de abultar el `vendor` chunk que carga `Vite`.

## 6. DX, logs y depuración

- Los comandos de formato, lint, test, build y validación escriben logs en `logs/tooling/`. Si fallan localmente o en CI, enlaza ese log en el issue o PR.
- Si agregas un comando nuevo de calidad, enrútalo por `scripts/tooling-task.ts` para mantener trazabilidad uniforme.
