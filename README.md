
# GeoVol 3D - Calculadora y Visualizador de Volúmenes Geométricos

## 1. Descripción General
**GeoVol 3D** es una aplicación web moderna (SaaS) desarrollada con React 19. Permite a ingenieros, estudiantes y diseñadores construir objetos 3D complejos mediante el apilamiento de primitivas geométricas, calculando en tiempo real sus propiedades físicas y visualizando el resultado tanto en planos técnicos (2D) como en un entorno tridimensional interactivo (3D).

## 2. Características Principales

### 🛠️ Modelado y Construcción
*   **Sistema de Capas**: Construcción secuencial de objetos.
*   **Primitivas Soportadas**: Cilindro, Cubo, Cono, Esfera, Cono Truncado, Pirámide, Prisma Rectangular.
*   **Edición Dinámica**: Modificación de altura, radios y dimensiones con actualización instantánea.

### 🎨 Visualización Dual Avanzada
*   **Vista Técnica 2D (Canvas API)**:
    *   Representación esquemática frontal con **Acotación Automática** (etiquetas de texto H/R dibujadas directamente en el canvas).
    *   **Zoom y Paneo Inteligente**: Navegación fluida con bloqueo de scroll nativo.
    *   **Auto-fit Reactivo**: Sistema inteligente que detecta cambios en dimensiones y reajusta el zoom automáticamente tras un breve retardo (debounce), permitiendo una edición cómoda sin saltos visuales.
*   **Vista Realista 3D (Three.js)**:
    *   **Persistencia de Cámara**: Arquitectura optimizada que mantiene la posición del usuario al actualizar la geometría.
    *   **Etiquetas Flotantes (CSS2D)**: Cotas de dimensión superpuestas al modelo 3D.
    *   **Optimización de Renderizado**: Reutilización de materiales e instancias para alto rendimiento.

### ⚖️ Motor de Física
*   **Cálculo de Volumen**: Sumatoria precisa de volúmenes parciales.
*   **Materiales**: Base de datos de densidades (Acero, Madera, Hormigón, Oro, etc.).
*   **Masa y Peso**: Cálculo automático de masa (kg) y fuerza/peso (N) según la gravedad estándar.

### 💾 Gestión de Datos
*   **Historial**: Deshacer/Rehacer (Undo/Redo) con atajos de teclado.
*   **Exportación**: Guardado de proyectos en JSON y exportación de tablas de datos a CSV.

---

## 3. Arquitectura y Patrones de Diseño

El proyecto ha sido diseñado siguiendo principios de ingeniería de software para asegurar escalabilidad y mantenibilidad:

### 🧩 Patrón Estrategia (Strategy Pattern)
La lógica de cálculo geométrico en `utils.ts` utiliza un patrón de estrategia (`FIGURE_STRATEGIES`). Esto permite añadir nuevas figuras geométricas en el futuro simplemente extendiendo el objeto de configuración, sin necesidad de modificar el flujo de control principal, cumpliendo con el principio **Open/Closed** de SOLID.

### 🎣 Custom Hooks (Separación de Intereses)
La lógica de estado y gestión de datos se ha encapsulado en el hook `useFigureManager` (`hooks.ts`). Esto separa la lógica de negocio de la interfaz de usuario (`App.tsx`), facilitando las pruebas y la reutilización del código.

### ⚡ Optimización Gráfica
En `Viewer3D.tsx`, se gestionan las instancias de Three.js para minimizar la recolección de basura (Garbage Collection). Los materiales y geometrías se crean y destruyen de manera controlada, y las etiquetas HTML se gestionan manualmente para evitar fugas de memoria en el DOM.

---

## 4. Estructura del Proyecto

### Componentes Principales (`/src/components`)

#### `LandingPage.tsx`
Página de presentación estilo SaaS.
*   **Diseño**: Hero section con animaciones CSS (blobs), lista de características y llamada a la acción.
*   **Identidad**: Refleja la marca GeoVol 3D (2025).

#### `FigureCard.tsx`
Tarjeta de edición para cada figura.
*   **SmartInput**: Controles numéricos táctiles (+/-) con validación de entrada.

#### `Summary.tsx`
Panel de resultados y configuración.
*   Calcula totales y gestiona la selección de materiales y exportación.

#### `Viewer2D.tsx`
Motor de renderizado técnico.
*   Usa HTML5 Canvas para dibujar vistas esquemáticas acotadas.

#### `Viewer3D.tsx`
Motor de renderizado realista.
*   Integra Three.js y CSS2DRenderer para una experiencia inmersiva.

---

## 5. Tecnologías

*   **Frontend**: React 19, TypeScript.
*   **Gráficos**: Three.js, CSS2DRenderer.
*   **Estilos**: Tailwind CSS v3.4.
*   **Iconos**: Lucide React.

---

## 6. Créditos

**Diseño y Desarrollo**: Daniel Alvarado  
**Año**: 2025
