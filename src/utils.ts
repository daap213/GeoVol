
import { FigureType, FigureParams, CalculationResult } from './types';

// Formatter utility
const fmt = (n: number) => n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);

// Strategy Interface
type FigureStrategy = {
    calculate: (params: FigureParams) => CalculationResult;
    getHeight: (params: FigureParams) => number;
};

// Scalable Strategy Map
const FIGURE_STRATEGIES: Record<FigureType, FigureStrategy> = {
    [FigureType.Cylinder]: {
        calculate: ({ radius, height }) => ({
            volume: Math.PI * Math.pow(radius, 2) * height,
            formula: `π · ${fmt(radius)}² · ${fmt(height)}`
        }),
        getHeight: (p) => p.height
    },
    [FigureType.Cube]: {
        calculate: ({ height }) => ({
            volume: Math.pow(height, 3),
            formula: `${fmt(height)}³`
        }),
        getHeight: (p) => p.height
    },
    [FigureType.TruncatedCone]: {
        calculate: ({ height, radius, radiusBottom }) => ({
            volume: (1 / 3) * Math.PI * height * (Math.pow(radius, 2) + (radius * radiusBottom) + Math.pow(radiusBottom, 2)),
            formula: `(1/3)·π·${fmt(height)}·(${fmt(radius)}² + ${fmt(radius)}·${fmt(radiusBottom)} + ${fmt(radiusBottom)}²)`
        }),
        getHeight: (p) => p.height
    },
    [FigureType.Cone]: {
        calculate: ({ radius, height }) => ({
            volume: (1 / 3) * Math.PI * Math.pow(radius, 2) * height,
            formula: `(1/3)·π·${fmt(radius)}²·${fmt(height)}`
        }),
        getHeight: (p) => p.height
    },
    [FigureType.Sphere]: {
        calculate: ({ radius }) => ({
            volume: (4 / 3) * Math.PI * Math.pow(radius, 3),
            formula: `(4/3)·π·${fmt(radius)}³`
        }),
        getHeight: (p) => p.radius * 2
    },
    [FigureType.Pyramid]: {
        calculate: ({ width, height }) => ({
            volume: (1 / 3) * Math.pow(width, 2) * height,
            formula: `(1/3)·${fmt(width)}²·${fmt(height)}`
        }),
        getHeight: (p) => p.height
    },
    [FigureType.RectangularPrism]: {
        calculate: ({ width, depth, height }) => ({
            volume: width * depth * height,
            formula: `${fmt(width)}·${fmt(depth)}·${fmt(height)}`
        }),
        getHeight: (p) => p.height
    }
};

export const calculateFigure = (type: FigureType, params: FigureParams): CalculationResult => {
    const strategy = FIGURE_STRATEGIES[type];
    if (!strategy) throw new Error(`Strategy for ${type} not implemented`);
    return strategy.calculate(params);
};

export const getFigureHeight = (type: FigureType, params: FigureParams): number => {
    const strategy = FIGURE_STRATEGIES[type];
    return strategy ? strategy.getHeight(params) : params.height;
};

export const getDefaultParams = (_type: FigureType): FigureParams => {
  return {
    height: 2,
    radius: 1,
    radiusBottom: 2,
    width: 2,
    depth: 2
  };
};

export const calculateMass = (volume: number, density: number, unit: string): number => {
    const conversionFactors: Record<string, number> = {
        'mm': 1e-9,
        'cm': 1e-6,
        'm': 1,
        'in': 0.000016387,
        'ft': 0.0283168
    };
    const factor = conversionFactors[unit] || 1;
    return (volume * factor) * density;
};

export const formatMass = (massKg: number): string => {
    if (massKg === 0) return '0 kg';
    if (massKg < 1) return (massKg * 1000).toFixed(2) + ' g';
    if (massKg > 1000) return (massKg / 1000).toFixed(2) + ' ton';
    return massKg.toFixed(2) + ' kg';
};

export const formatForce = (newtons: number): string => {
    if (newtons === 0) return '0 N';
    if (newtons > 1000) return (newtons / 1000).toFixed(2) + ' kN';
    return newtons.toFixed(2) + ' N';
};
