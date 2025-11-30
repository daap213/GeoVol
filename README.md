
# GeoVol 3D - Calculadora y Visualizador de Volúmenes Geométricos

## 1. Descripción General
**GeoVol 3D** es una aplicación web progresiva (SPA) desarrollada con React 19 diseñada para estudiantes y profesionales. Permite construir objetos 3D complejos mediante el apilamiento de primitivas geométricas (cilindros, cubos, conos, etc.), calculando en tiempo real sus propiedades físicas y visualizando el resultado tanto en planos técnicos (2D) como en un entorno tridimensional interactivo (3D).

## 2. Características Principales

### 🛠️ Modelado y Construcción
*   **Sistema de Capas**: Construcción secuencial de objetos.
*   **Primitivas Soportadas**: Cilindro, Cubo, Cono, Esfera, Cono Truncado, Pirámide, Prisma Rectangular.
*   **Edición Dinámica**: Modificación de altura, radios y dimensiones con actualización instantánea.

### 🎨 Visualización Dual Avanzada
*   **Vista Técnica 2D (Canvas API)**:
    *   Representación esquemática frontal con **Acotación Automática** (etiquetas de texto H/R dibujadas directamente en el canvas).
    *   **Zoom y Paneo Inteligente**: Navegación fluida con bloqueo de scroll nativo (EventListener pasivo desactivado).
    *   **Auto-fit Reactivo**: Sistema inteligente que detecta cambios tanto en la cantidad de figuras como en sus **dimensiones individuales** (radio/altura). Utiliza un *debounce* (retardo) de 600ms para reajustar el zoom automáticamente al terminar de editar, evitando saltos visuales durante la escritura.
*   **Vista Realista 3D (Three.js)**:
    *   **Persistencia de Cámara**: La arquitectura separa la inicialización de la escena de la actualización de geometría. Esto permite que la cámara mantenga su posición, ángulo y zoom exactos incluso cuando se modifican parámetros o se agregan figuras.
    *   **Etiquetas Flotantes (CSS2D)**: Cotas de dimensión (Altura, Radio/Ancho) renderizadas como elementos HTML que flotan sobre el objeto 3D.
    *   **Limpieza de Memoria (Garbage Collection)**: Implementación de limpieza manual del DOM para eliminar correctamente las etiquetas flotantes al borrar figuras, evitando "etiquetas fantasma".
    *   **Enfoque Dinámico**: El punto de pivote (target) de la cámara se actualiza suavemente al centro de masa del objeto compuesto.

### ⚖️ Motor de Física
*   **Cálculo de Volumen**: Sumatoria precisa de volúmenes parciales.
*   **Materiales**: Selección de densidad basada en materiales reales (Acero, Madera, Hormigón, Oro, etc.).
*   **Material Personalizado**: Opción para ingresar manualmente una densidad específica (kg/m³).
*   **Masa y Peso**:
    *   Cálculo de Masa (g, kg, ton).
    *   Cálculo de Peso/Fuerza (N, kN) considerando gravedad estándar ($g=9.81 m/s^2$).

### 💾 Gestión de Datos y Productividad
*   **Deshacer/Rehacer (Undo/Redo)**: Historial completo de acciones con soporte para atajos de teclado (`Ctrl+Z`, `Ctrl+Shift+Z`).
*   **Importar/Exportar**:
    *   **JSON**: Guardar y cargar el estado completo del proyecto.
    *   **CSV**: Exportar tabla de datos para análisis en Excel/Sheets.
*   **Unidades**: Selector global (mm, cm, m, in, ft) que ajusta los cálculos físicos automáticamente.

### 📱 Experiencia de Usuario (UX)
*   **Inputs Mejorados**: Controles numéricos personalizados con botones de incremento/decremento (+/-) y validación visual.
*   **Scroll Adaptativo**: El contenedor de capas crece dinámicamente hasta aprovechar el espacio disponible en pantalla antes de mostrar barras de desplazamiento.
*   **Diseño Responsivo**: Interfaz adaptable que maximiza el área de trabajo en escritorio y se compacta en móviles.

---

## 3. Estructura del Proyecto

El proyecto utiliza una arquitectura modular basada en componentes funcionales de React y Hooks.

### Archivos Principales
| Archivo | Descripción |
| :--- | :--- |
| **`index.tsx`** | Punto de entrada. Montaje del DOM virtual. |
| **`App.tsx`** | **Controlador Principal**. Gestiona el estado global (`figures`), historial, configuración de materiales y layout general. Implementa lógica de altura dinámica para listas (`max-h` adaptativo). |
| **`types.ts`** | **Definiciones**. Interfaces TypeScript (`FigureData`, `Material`) y constantes del sistema. |
| **`utils.ts`** | **Lógica de Negocio**. Funciones puras para cálculos geométricos, conversión de unidades y formateo de monedas/física. |

### Componentes (`/src/components`)

#### 1. `FigureCard.tsx`
Tarjeta de interfaz para cada figura geométrica.
*   **`SmartInput`**: Componente interno extraído para estabilidad del foco. Elimina selectores nativos y añade botones táctiles (+/- 0.5).
*   Muestra la fórmula matemática específica con los valores sustituidos.

#### 2. `Summary.tsx`
Panel de resumen y configuración global.
*   Calcula totales de Volumen, Altura, Masa y Peso.
*   Contiene el selector de materiales (con input condicional para "Personalizado") y la lógica de exportación.

#### 3. `Viewer2D.tsx`
Motor de renderizado 2D.
*   Usa `<canvas>` HTML5.
*   **Render Loop**: Optimizado para dibujar texto de cotas y figuras simultáneamente con redibujado instantáneo.
*   **Lógica de Zoom**: Calcula el ancho máximo real (considerando si la figura es cubo, cilindro o prisma) para ajustar el *viewport* correctamente.

#### 4. `Viewer3D.tsx`
Motor de renderizado 3D Avanzado.
*   **Arquitectura Init/Update**:
    *   `useEffect` 1 (Init): Crea escena, cámara, luces y renderers una sola vez.
    *   `useEffect` 2 (Update): Gestiona mallas y etiquetas.
*   **Gestión de Recursos**: Elimina geometrías y materiales antiguos. Itera manualmente sobre los hijos de las mallas para eliminar `CSS2DObject.element` del DOM, solucionando problemas de persistencia visual.

---

## 4. Apéndice Matemático

Fórmulas utilizadas para el cálculo de volumen ($V$):

*   **Cilindro**: $V = \pi \cdot r^2 \cdot h$
*   **Cubo**: $V = l^3$ (donde $l=altura$)
*   **Esfera**: $V = \frac{4}{3} \cdot \pi \cdot r^3$
*   **Cono**: $V = \frac{1}{3} \cdot \pi \cdot r^2 \cdot h$
*   **Cono Truncado**: $V = \frac{1}{3} \cdot \pi \cdot h \cdot (r_1^2 + r_1 \cdot r_2 + r_2^2)$
*   **Pirámide (Base Cuadrada)**: $V = \frac{1}{3} \cdot l^2 \cdot h$
*   **Prisma Rectangular**: $V = w \cdot d \cdot h$

**Cálculos Físicos:**
*   **Masa ($m$)**: $m = V_{m^3} \cdot \text{Densidad}$
*   **Peso ($F$)**: $F = m \cdot 9.81 m/s^2$

---

## 5. Tecnologías

*   **Core**: React 19, TypeScript.
*   **Gráficos**: Three.js (0.181+) + CSS2DRenderer.
*   **Estilos**: Tailwind CSS (v3.4).
*   **Iconos**: Lucide React.

---

## 6. Instalación y Uso

1.  Clonar el repositorio.
2.  Instalar dependencias: `npm install`.
3.  Ejecutar: `npm start`.
4.  **Uso Básico**:
    *   Seleccione una figura en el panel izquierdo y pulse **"+"**.
    *   Ajuste las dimensiones usando los botones +/- o escribiendo.
    *   Use la regla 📏 en la vista 3D para ver las medidas.
    *   Use el selector de unidades arriba para cambiar todo el sistema (ej. a metros).
