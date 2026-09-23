# Reglas de autoría por campo y trampas de interpretación

## Separación previa

Antes de editar, marcar cada instrucción del original como mecanismo visual, objetivo de transformación, contenido temático, formato de salida, referencia de descubrimiento o ejemplo. Una frase puede mezclar funciones. No basta con cambiar nombres ni con añadir “transferable”, “any subject” o “no fixed scene”. El texto siguiente puede contradecir esas frases.

Para un derivado portable, el pedido conserva sujeto, acción, entorno y texto. Para un perfil o tema seleccionado, anotar qué decisiones adicionales se autorizaron. Si hay choque con un bloqueo explícito, no combinar instrucciones contrarias: conservar el bloqueo y registrar la incompatibilidad. No inventar un parser semántico nuevo para ocultar una mala decisión editorial.

## Los ocho campos

### aesthetic

Definir medio y mecanismo dominante. Ejemplo útil: “Relieve de tinta con masas sólidas y huecos tallados”. Ejemplo de riesgo: “Ruinas sagradas con caballeros”. No convertir “relieve” en mero nombre: explicar cómo se construyen formas y valores. Las ruinas pertenecen a una dirección temática cuando fueron pedidas.

### subject_treatment

Explicar cómo se traducen las formas existentes: simplificación, contornos, proporciones autorizadas y detalle interno. No introducir “one girl”, “warrior holding” o una profesión. Si el preset transforma anatomía o vestuario intencionalmente, clasificarlo como transformación explícita; no presentarlo como preservación neutral.

### color_and_tone

Definir relaciones entre valores y colores, acentos y saturación. No introducir objetos para justificar una paleta: “acento rojo” no exige sangre. Distinguir una paleta fija que es parte de un perfil de una paleta flexible. Un conflicto con colores explícitos debe resolverse en el contrato, no con dos mandatos incompatibles.

### lighting_and_shadow

Describir dirección, tamaño y dureza de fuentes, agrupación de sombras y respuesta a la luz. Evitar inventar una ventana, neón físico o puesta de sol. El modificador de luz puede cambiar iluminación cuando está seleccionado, pero no el lugar por asociación. No usar “physically accurate” como certificado sin comprobación.

### texture_and_material

Describir escala, distribución y comportamiento. El material concreto es una señal útil: conservar roble, vidrio o fieltro cuando es el objetivo. Quitar la muestra o escena no pedida, no la identidad material. No usar simultáneamente “crecer, erosionar, fracturar, pulir y derretir” sin elegir el mecanismo correcto. Distinguir pigmento sobre la imagen de madera en el objeto representado.

### camera_and_composition

Para apariencia: respetar cámara y organización solicitadas, explicar legibilidad dentro de ellas. Para perfil: conservar proyección, escala o layout expresamente elegidos. No mezclar side-view, isométrico y cenital en un mismo mandato. En preserve no reintroducir composición desde aesthetic, subject_treatment o atmosphere_and_mood cuando el campo de cámara está apagado.

### atmosphere_and_mood

Expresar sensación mediante ritmo, tensión, contraste y espacio. “Solemne” no obliga a añadir un funeral; “extraño” no exige un corredor vacío. No usar este campo como lista encubierta de props, lore, eventos o personajes. Un tema puede conservar narrativa explícita, pero su clasificación debe advertirlo.

### rendering_and_quality

Definir acabado observable: jerarquía de bordes, detalle controlado, bandas de sombra, separación de planos o grano coherente. Evitar adjetivos vacíos como “masterpiece”, “8K” o “high quality” como sustituto de la descripción. “Heavy denoise” no equivale a un parámetro real del proveedor. No sacrificar la técnica del preset por imponer acabado genérico.

## Negativos, permisos y metadatos

Revisar `avoidRules`, `attributes.negativePrompt` y reglas de política cuando existan. No prohibir `text` si el caso pide PAUSA ni `illustration` cuando se combina con un estilo dibujado. No borrar negativos de manera global: explicar qué conflicto se resuelve y en qué alcance. Una lista negativa no compensa instrucciones positivas que repiten escenas.

Conservar alias y referencias útiles en metadata para encontrar el preset. No trasladar automáticamente esos nombres al prompt. La frontera de metadatos no elimina referencias que ya estén escritas dentro de un campo activo. Revisar el prompt efectivo y los blends recién guardados.

Los nombres cortos son etiquetas de navegación. Usar un descriptor concreto para distinguirlos, sin inventar una técnica, historia o promesa de calidad. No cambiar `id`, `packId`, claves de categoría o referencias de favoritos como parte de un renombrado visual.

El contrato actual de políticas usa `requires` como un permiso o `null`, no una lista arbitraria. Los permisos disponibles incluyen `structure`, `wardrobe`, `design`, `environment`, `materialTarget` y `accent`; confirmar el contrato actual antes de editar. Si una propuesta necesita una combinación no expresable sin cambiar arquitectura, escalar esa decisión: no falsear compatibilidad.

## Cuándo conservar, derivar, agrupar o archivar

Conservar cuando el preset cumple una función reconocible, aunque sea especializada. Derivar cuando se quiere conservar el mecanismo visual pero cambiar tema, cámara o alcance; el original sigue disponible. Proponer variante cuando el cambio parece limitarse a una dimensión, pero comprobar negativos, medio, permisos y resultados antes de decidir. Proponer archivo cuando la función no aporta una diferencia útil y existe una alternativa revisada.

Cero grupos de DNA exactamente iguales no demuestra ausencia de redundancia semántica. Dos imágenes parecidas no demuestran equivalencia de comportamiento. Dos etiquetas casi iguales no demuestran duplicado. Registrar candidato A, candidato B, hipótesis de diferencia, sujetos comparados, evidencia real y decisión pendiente.

No desplegar archive/redirect ni migrar favoritos durante una tarea de redacción. El PR todavía no implementa ese ciclo de vida. Una propuesta escrita no es una operación aplicada.

## Ejemplos antes/después

[examples.json](examples.json) reúne doce casos vinculados a archivos reales. `before` es el valor del campo en la fuente identificada por hash. `after` es una propuesta didáctica para un campo, no un manifiesto completo. `wrongFix` indica el atajo que debe evitarse. No copiar un ejemplo de pigmento a un sensor, ni una corrección de derivado libre al perfil que debe conservar su cámara.

Si el hash cambia, releer la fuente. No regenerar hashes para aparentar que una referencia vieja sigue revisada. Las versiones nuevas necesitan evidencia y estado propios.
