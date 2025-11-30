# GeoVol 3D - Calculadora y Visualizador de Volúmenes Geométricos

## 1. Descripción General
**GeoVol 3D** es una aplicación web progresiva (SPA) desarrollada con React 19 diseñada para estudiantes y profesionales. Permite construir objetos 3D complejos mediante el apilamiento de primitivas geométricas (cilindros, cubos, conos, etc.), calculando en tiempo real sus propiedades físicas y visualizando el resultado tanto en planos técnicos (2D) como en un entorno tridimensional interactivo (3D).

## 2. Características Principales

### 🛠️ Modelado y Construcción
*   **Sistema de Capas**: Construcción secuencial de objetos.
*   **Primitivas Soportadas**: Cilindro, Cubo, Cono, Esfera, Cono Truncado, Pirámide, Prisma Rectangular.
*   **Edición Dinámica**: Modificación de altura, radios y dimensiones con actualización instantánea.

### 🎨 Visualización Dual
*   **Vista Técnica 2D (Canvas API)**:
    *   Representación esquemática frontal.
    *   **Zoom y Paneo Inteligente**: Navegación fluida con rueda del ratón (Zoom) y arrastre (Pan).
    *   *Nota Técnica*: Implementación de eventos no pasivos para evitar el scroll de la página al hacer zoom.
    *   **Auto-fit**: Ajuste automático de la escala para encuadrar el objeto.
*   **Vista Realista 3D (Three.js)**:
    *   Renderizado de alta fidelidad con luces y sombras.
    *   Controles orbitales (rotar, mover, acercar).
    *   **Modo Rayos X (Wireframe)**: Opción para ver la estructura interna y aristas del objeto.

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
*   **Inputs Mejorados**: Controles numéricos personalizados con botones de incremento/decremento (+/-) y validación visual (bordes rojos para valores inválidos).
*   **Diseño Responsivo**: Interfaz adaptable a móviles, tablets y escritorio.
*   **Layout Optimizado**: Ajuste dinámico de alturas para evitar espacios vacíos en listas cortas.

---

## 3. Estructura del Proyecto

El proyecto utiliza una arquitectura modular basada en componentes funcionales de React y Hooks.

### Archivos Principales
| Archivo | Descripción |
| :--- | :--- |
| **`index.tsx`** | Punto de entrada. Montaje del DOM virtual. |
| **`App.tsx`** | **Controlador Principal**. Gestiona el estado global (`figures`), historial, configuración de materiales y layout general. |
| **`types.ts`** | **Definiciones**. Interfaces TypeScript (`FigureData`, `Material`) y constantes del sistema. |
| **`utils.ts`** | **Lógica de Negocio**. Funciones puras para cálculos geométricos, conversión de unidades y formateo de monedas/física. |

### Componentes (`/src/components`)

#### 1. `FigureCard.tsx`
Tarjeta de interfaz para cada figura geométrica.
*   **`SmartInput`**: Componente interno extraído para evitar re-renderizados innecesarios. Elimina los selectores nativos del navegador y añade botones táctiles para mejor control.
*   Muestra la fórmula matemática específica con los valores sustituidos.

#### 2. `Summary.tsx`
Panel de resumen y configuración global.
*   Calcula totales de Volumen, Altura, Masa y Peso.
*   Contiene el selector de materiales y la lógica de exportación.

#### 3. `Viewer2D.tsx`
Motor de renderizado 2D.
*   Usa un `<canvas>` HTML5.
*   Dibuja las figuras apiladas calculando coordenadas relativas.
*   Gestiona la matriz de transformación (Escala, X, Y) para el zoom y paneo.

#### 4. `Viewer3D.tsx`
Motor de renderizado 3D.
*   Inicializa una escena `THREE.Scene`.
*   Convierte los datos de `FigureParams` en geometrías de Three.js (`CylinderGeometry`, `BoxGeometry`, etc.).
*   Gestiona el ciclo de renderizado (`requestAnimationFrame`) y limpieza de memoria.

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
*   **Gráficos**: Three.js (0.181+).
*   **Estilos**: Tailwind CSS (v3.4).
*   **Iconos**: Lucide React.
*   **Build**: Entorno estándar de ES Modules.

---

## 6. Instalación y Uso

1.  Clonar el repositorio.
2.  Instalar dependencias (si se usa entorno local Node): `npm install`.
3.  Ejecutar: `npm start`.
4.  **Uso Básico**:
    *   Seleccione una figura en el panel izquierdo y pulse **"+"**.
    *   Ajuste las dimensiones en la tarjeta creada.
    *   Cambie la vista entre 2D y 3D en el panel derecho.
    *   Seleccione el material en el panel superior para ver el peso estimado.
