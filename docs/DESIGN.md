# Sistema de Diseño y UX

## 1. Filosofía de Diseño

El diseño de Codex Image Studio se inspira en interfaces de software profesional (como herramientas de edición de video, DAWs o motores de juego). Prioriza la densidad de información, la precisión técnica y una estética oscura ("Dark Mode" por defecto) para reducir la fatiga visual y hacer que las imágenes generadas destaquen sobre la interfaz.

## 2. Paleta de Colores

- **Fondo Principal:** Negro puro (`#000000`) y grises muy oscuros (`zinc-900`, `zinc-950`).
- **Superficies (Paneles, Tarjetas):** Fondos translúcidos con desenfoque (`bg-white/5 backdrop-blur`).
- **Acentos:** Colores vibrantes para indicar estados y acciones.
  - Primario: Tonos esmeralda/acento para acciones principales (ej. botón de generar).
  - Peligro: Tonos rojos (`red-500`) para eliminaciones (Purge).
  - Información: Tonos azules/cian para métricas y tokens.
- **Texto:** Blanco para texto principal, `zinc-400` y `zinc-500` para texto secundario y metadatos.

## 3. Tipografía

- **Sans-serif (UI General):** Inter o fuentes del sistema. Se utiliza para la legibilidad en la interfaz general.
- **Monospace (Datos Técnicos):** JetBrains Mono o similar. Se utiliza para mostrar IDs, tokens, costos, logs del sistema y parámetros técnicos, reforzando la sensación de "herramienta de desarrollo".
- **Jerarquía:** Uso extensivo de texto pequeño en mayúsculas con amplio espaciado entre letras (`text-[10px] uppercase tracking-widest`) para etiquetas y metadatos, creando una apariencia limpia y técnica.

## 4. Animaciones y Transiciones

- **Framer Motion:** Utilizado para transiciones de diseño (Layout animations) y micro-interacciones (hover, tap).
- **View Transitions API:** Implementado para transiciones fluidas de pantalla completa (ej. abrir el carrusel de imágenes desde la cuadrícula), proporcionando una experiencia casi nativa.
- **Curvas de Aceleración:** Uso de curvas personalizadas (ej. `cubic-bezier(0.19, 1, 0.22, 1)`) para movimientos rápidos pero suaves y profesionales.

## 5. Interacción del Usuario

- **Arrastrar y Soltar (Drag & Drop):** Soporte global para soltar imágenes de referencia en la aplicación.
- **Atajos de Teclado:** Navegación con flechas en el carrusel, tecla `Escape` para cerrar modales, y barra espaciadora para comparar la imagen generada con la referencia original.
- **Feedback Visual:** Uso de `ToastContainer` para notificaciones no intrusivas sobre el éxito o fracaso de las acciones, y cursores personalizados para acciones específicas (ej. dibujar máscaras).
