# Electron: direccion propuesta

Este documento no anuncia una build Electron inmediata; fija el enfoque recomendado para llegar ahi sin convertir el renderer en un amasijo de APIs de escritorio.

## Situacion actual

Hoy el producto funciona como una UI React/Vite que habla con un backend local Bun/Hono por HTTP. Ese flujo ya es util y sigue siendo el camino principal.

La nueva pieza que se introdujo para preparar el terreno es el **Studio Runtime**:

- el renderer ya no asume ciegamente `http://localhost:4317`;
- primero intenta leer `window.codexStudio?.apiBase`;
- luego `VITE_STUDIO_API_BASE`;
- y solo al final cae al `localhost` por defecto.

Eso nos da una costura real para un futuro adapter desktop.

Ademas, el repo ya incluye una shell minima de Electron para explorar ese camino sin prometer todavia un empaquetado final:

- `bun run dev:electron` — levanta backend local + Vite + ventana Electron contra el dev server.
- `bun run preview:electron` — compila `dist/`, arranca el backend local y carga la UI empaquetada dentro de Electron.

Si ya tienes backend o renderer activos, los scripts intentan reutilizarlos antes de lanzar nuevos procesos.

Variables utiles:

- `STUDIO_ELECTRON_API_BASE` para apuntar a otro backend local.
- `STUDIO_ELECTRON_RENDERER_URL` para usar otro dev server durante `dev:electron`.

## Recomendacion oficial a respetar

Basado en la documentacion actual de Electron, la ruta segura para este proyecto deberia conservar estas reglas:

- `BrowserWindow` con `preload` explicito;
- `nodeIntegration: false`;
- `contextIsolation: true`;
- `sandbox: true` cuando sea viable con nuestras necesidades reales;
- exponer desde `preload` solo wrappers minimos via `contextBridge`;
- no filtrar `ipcRenderer` completo al renderer;
- bloquear navegacion inesperada y apertura arbitraria de ventanas.

En desarrollo, Electron puede cargar la URL del dev server; en produccion debe cargar archivos locales empaquetados.

## Donde esta la friccion real

La ventana Electron en si no es el problema grande. El cuello de botella esta en el backend local:

- `apps/local-server` usa APIs especificas de Bun como `Bun.serve` y `Bun.file`;
- el desktop main process de Electron corre sobre Node, no sobre Bun;
- el producto tambien depende de `codex app-server` y de una sesion local autenticada del usuario.

En otras palabras: agregar un `BrowserWindow` es facil; empaquetar bien el runtime local completo es la parte seria.

## Estrategia recomendada por fases

### Fase 1: renderer preparado

Hecho parcialmente ahora:

- el renderer resuelve su API base desde runtime;
- el onboarding ya valida backend, Codex CLI, `codex app-server` y biblioteca local;
- la UI sigue siendo funcional en navegador sin atarse a Electron.

### Fase 2: adapter desktop minimo

Objetivo:

- crear proceso `main` + `preload`;
- cargar la UI Vite en dev y archivos estaticos en produccion;
- inyectar `window.codexStudio.apiBase` desde `preload`;
- mantener el backend local como proceso separado supervisado por desktop.

Estado actual:

- `electron/main.cjs` crea un `BrowserWindow` seguro y bloquea navegacion inesperada;
- `electron/preload.cjs` expone solo `window.codexStudio` via `contextBridge`;
- los scripts `dev:electron` y `preview:electron` levantan el shell desktop sin acoplar el renderer a APIs de Electron.

Esta fase evita reescribir el renderer y convierte Electron en un adapter nuevo en el seam del Studio Runtime.

### Fase 3: empaquetado serio

Opciones a evaluar:

1. empaquetar Bun junto con la app y supervisar `apps/local-server` como proceso hijo;
2. portar el adapter del backend local a un runtime Node-compatible si Electron pasa a ser el canal principal.

La opcion 1 conserva mas codigo actual.
La opcion 2 reduce dependencias de runtime externas, pero implica mas trabajo en el adapter del backend.

## Decision practica por ahora

Para la proxima etapa open-source, la recomendacion es:

- **no** intentar una build Electron completa todavia;
- **si** seguir consolidando el Studio Runtime y el onboarding;
- **si** mantener el renderer limpio de dependencias directas de Electron;
- **si** tratar Electron como un adapter futuro, no como una reescritura del producto.

En otras palabras: ya existe un desktop shell de trabajo para validar UX y seams; lo que todavia no existe es una distribucion final empaquetada y soportada.

## Checklist antes de intentar la build desktop

- definir como se empacara o supervisara Bun;
- confirmar comportamiento de `codex app-server` dentro de una app desktop distribuida;
- revisar rutas por OS para la Studio Library;
- decidir el canal de logs y health-check entre main, preload y renderer;
- agregar restricciones de navegacion y apertura de ventanas desde el primer prototipo.
