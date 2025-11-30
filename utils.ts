import { FigureType, FigureParams, CalculationResult } from './types';

export const calculateFigure = (type: FigureType, params: FigureParams): CalculationResult => {
  let vol = 0;
  let formula = '';
  const { height, radius, radiusBottom, width, depth } = params;

  // Formatter for display
  const fmt = (n: number) => n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);

  switch (type) {
    case FigureType.Cylinder:
      vol = Math.PI * Math.pow(radius, 2) * height;
      formula = `π · ${fmt(radius)}² · ${fmt(height)}`;
      break;

    case FigureType.Cube:
      // Cube uses height as side length
      vol = Math.pow(height, 3);
      formula = `${fmt(height)}³`;
      break;

    case FigureType.TruncatedCone:
      // V = (1/3) * π * h * (r1^2 + r1*r2 + r2^2)
      vol = (1 / 3) * Math.PI * height * (Math.pow(radius, 2) + (radius * radiusBottom) + Math.pow(radiusBottom, 2));
      formula = `(1/3)·π·${fmt(height)}·(${fmt(radius)}² + ${fmt(radius)}·${fmt(radiusBottom)} + ${fmt(radiusBottom)}²)`;
      break;

    case FigureType.Cone:
      vol = (1 / 3) * Math.PI * Math.pow(radius, 2) * height;
      formula = `(1/3)·π·${fmt(radius)}²·${fmt(height)}`;
      break;

    case FigureType.Sphere:
      // Volume based on radius
      vol = (4 / 3) * Math.PI * Math.pow(radius, 3);
      formula = `(4/3)·π·${fmt(radius)}³`;
      break;

    case FigureType.Pyramid:
      // Assuming square base where side = width (or height if simplified in UI)
      // V = (1/3) * BaseArea * h
      // Here we assume Base is a square with side 'width'
      vol = (1 / 3) * Math.pow(width, 2) * height;
      formula = `(1/3)·${fmt(width)}²·${fmt(height)}`;
      break;

    case FigureType.RectangularPrism:
      vol = width * depth * height;
      formula = `${fmt(width)}·${fmt(depth)}·${fmt(height)}`;
      break;
  }

  return { volume: vol, formula };
};

export const getDefaultParams = (type: FigureType): FigureParams => {
  return {
    height: 2,
    radius: 1,
    radiusBottom: 2,
    width: 2,
    depth: 2
  };
};

export const getFigureHeight = (type: FigureType, params: FigureParams): number => {
    if (type === FigureType.Sphere) {
        return params.radius * 2;
    }
    return params.height;
}