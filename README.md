# GeoVol 3D - Calculadora y Visualizador de Volúmenes Geométricos

## Descripción General
GeoVol 3D es una aplicación web interactiva desarrollada en React diseñada para la construcción virtual de objetos 3D compuestos a partir de primitivas geométricas (cilindros, cubos, conos, esferas, etc.). La herramienta permite calcular en tiempo real el volumen total, la altura acumulada y estimar propiedades físicas como la masa y el peso basándose en materiales seleccionados.

El proyecto destaca por su capacidad de visualización dual (2D y 3D), gestión de unidades de medida, y herramientas de productividad como deshacer/rehacer y exportación de datos.

---

## Características Principales

1.  **Modelado Compuesto**: Apilamiento secuencial de figuras geométricas.
2.  **Visualización Dual**:
    *   **2D (Canvas)**: Vista esquemática frontal con herramientas de Zoom y Paneo.
    *   **3D (Three.js)**: Renderizado realista con iluminación, sombras, rotación orbital y modo "Alambre/Corte".
3.  **Cálculos Físicos**:
    *   Cálculo de Volumen acumulado.
    *   Estimación de Masa (kg/g/ton) basada en densidad de materiales.
    *   Cálculo de Peso/Fuerza (Newton/kN).
    *   Materiales personalizables (densidad editable).
4.  **Gestión de Datos**:
    *   Exportación a JSON (guardar proyecto) y CSV (Excel).
    *   Importación de configuraciones previas.
    *   Historial de cambios (Undo/Redo) con atajos de teclado (Ctrl+Z).
5.  **UX Avanzada**:
    *   Inputs inteligentes con validación visual.
    *   Diseño responsivo y minimalista.
    *   Selector de unidades dinámico (mm, cm, m, in, ft).

---

## Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en componentes funcionales de React.

### 1. Archivos Principales

*   **`index.tsx`**: Punto de entrada de la aplicación. Monta el componente raíz en el DOM.
*   **`App.tsx`**: Componente raíz y controlador principal.
    *   Gestiona el estado global: lista de figuras (`figures`), historial (`history`), configuración de materiales y unidades.
    *   Coordina la comunicación entre el panel de control, el resumen y los visualizadores.
    *   Implementa la lógica de `Undo/Redo` y la carga de archivos.

### 2. Lógica y Tipos (`/src`)

*   **`types.ts`**: Definiciones de TypeScript.
    *   `FigureType`: Enum con las figuras soportadas.
    *   `FigureData`: Interfaz principal de un objeto figura.
    *   `MATERIALS`: Constante con los presets de densidades (Acero, Madera, etc.).
*   **`utils.ts`**: Biblioteca de funciones puras.
    *   `calculateFigure()`: Contiene las fórmulas matemáticas (V = πr²h, etc.).
    *   `calculateMass()`: Conversión de unidades y cálculo de masa.
    *   `exportToCSV()`: Generación de archivos descargables.

### 3. Componentes (`/src/components`)

*   **`FigureCard.tsx`**: Tarjeta individual para cada capa/figura.
    *   Contiene el componente `SmartInput` para la edición de valores numéricos.
    *   Maneja la validación de inputs (bordes rojos si valor <= 0).
    *   Muestra la fórmula específica y el volumen parcial de esa figura.

*   **`Summary.tsx`**: Panel de resumen superior.
    *   Muestra totales (Volumen, Altura, Masa, Peso).
    *   Contiene el selector de Materiales y el input de densidad personalizada.
    *   Botones de Exportación e Importación.

*   **`Viewer2D.tsx`**: Visualizador Técnico.
    *   Tecnología: **HTML5 Canvas API**.
    *   Renderiza una vista frontal esquemática.
    *   Implementa lógica de transformación matricial manual para **Zoom** (escala) y **Paneo** (traslación) con el mouse.
    *   Incluye función "Auto-fit" para ajustar el dibujo a la pantalla.

*   **`Viewer3D.tsx`**: Visualizador Realista.
    *   Tecnología: **Three.js**.
    *   Genera mallas 3D (`THREE.Mesh`) basadas en los parámetros de las figuras.
    *   Gestiona cámara, luces, sombras y controles orbitales (`OrbitControls`).
    *   Implementa el modo "Wireframe" (Alambre) reduciendo la opacidad y añadiendo estructuras de líneas.

---

## Guía de Funcionamiento Técnico

### Flujo de Datos
1.  El usuario selecciona una figura y hace clic en "Agregar".
2.  `App.tsx` crea un objeto `FigureData` con parámetros por defecto (`utils.ts`).
3.  El estado `figures` se actualiza.
4.  **React Re-renderiza**:
    *   `Summary` recalcula los totales sumando el array.
    *   `FigureCard` genera una nueva tarjeta.
    *   `Viewer3D` y `Viewer2D` reciben el nuevo array y reconstruyen la escena visual.

### Sistema de Unidades
El sistema base de cálculo es agnóstico, pero para la física (Masa) se asume que la densidad está en **kg/m³**.
*   El archivo `utils.ts` contiene factores de conversión. Si el usuario selecciona "mm", el volumen se divide por $10^9$ antes de multiplicar por la densidad para obtener la masa en kg correcta.

### Historial (Undo/Redo)
Se utiliza un patrón de doble pila:
*   `history`: Array de estados pasados.
*   `future`: Array de estados deshechos (para rehacer).
*   Cada vez que se agrega o elimina una figura, el estado actual se empuja a `history`.

---

## Stack Tecnológico

*   **Frontend Library**: React 19
*   **Lenguaje**: TypeScript
*   **Gráficos 3D**: Three.js (Vanilla implementation wrapped in React)
*   **Estilos**: Tailwind CSS
*   **Iconos**: Lucide React
