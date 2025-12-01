export enum FigureType {
  Cylinder = 'Cilindro',
  Cube = 'Cubo',
  Cone = 'Cono',
  Sphere = 'Esfera',
  TruncatedCone = 'Cono Truncado',
  Pyramid = 'Pirámide',
  RectangularPrism = 'Prisma Rectangular'
}

export interface FigureParams {
  height: number;
  radius: number;       // Used for Cylinder, Cone, Sphere, TruncatedCone (top)
  radiusBottom: number; // Used for TruncatedCone
  width: number;        // Used for Prism (and Cube logic internally)
  depth: number;        // Used for Prism
}

export interface FigureData {
  id: number;
  type: FigureType;
  params: FigureParams;
  volume: number;
  formula: string;
}

export interface CalculationResult {
  volume: number;
  formula: string;
}

export interface Material {
  name: string;
  density: number; // kg/m^3
  color: string;
  roughness: number;
  metalness: number;
}

export const MATERIALS: Record<string, Material> = {
  DEFAULT: { name: 'Genérico', density: 1000, color: '#3b82f6', roughness: 0.7, metalness: 0.1 },
  STEEL: { name: 'Acero', density: 7850, color: '#94a3b8', roughness: 0.2, metalness: 0.8 },
  WOOD: { name: 'Madera (Roble)', density: 750, color: '#a87132', roughness: 0.9, metalness: 0.0 },
  CONCRETE: { name: 'Hormigón', density: 2400, color: '#9ca3af', roughness: 0.95, metalness: 0.0 },
  PLASTIC: { name: 'Plástico', density: 950, color: '#ef4444', roughness: 0.1, metalness: 0.0 },
  GOLD: { name: 'Oro', density: 19300, color: '#fbbf24', roughness: 0.1, metalness: 1.0 },
  CUSTOM: { name: 'Personalizado', density: 1000, color: '#a3a3a3', roughness: 0.5, metalness: 0.5 },
};

export interface Project {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  data: FigureData[];
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}