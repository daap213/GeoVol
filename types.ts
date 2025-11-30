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