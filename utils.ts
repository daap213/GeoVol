
import { FigureType, FigureParams, CalculationResult, FigureData, MATERIALS } from './types';

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

export const calculateMass = (volume: number, density: number, unit: string): number => {
    // Volume is in unit^3. Density is in kg/m^3.
    // We need to convert volume to m^3 based on the unit.
    
    let conversionFactorToM3 = 1;
    
    switch(unit) {
        case 'mm': conversionFactorToM3 = 1e-9; break;
        case 'cm': conversionFactorToM3 = 1e-6; break;
        case 'm': conversionFactorToM3 = 1; break;
        case 'in': conversionFactorToM3 = 0.000016387; break;
        case 'ft': conversionFactorToM3 = 0.0283168; break;
    }

    const volumeInM3 = volume * conversionFactorToM3;
    const massKg = volumeInM3 * density;
    
    return massKg;
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

export const exportToCSV = (figures: FigureData[], unit: string) => {
    const headers = ['ID', 'Tipo', 'Altura', 'Radio', 'RadioInf', 'Ancho', 'Profundidad', 'Volumen', 'Formula'];
    const rows = figures.map(f => [
        f.id,
        f.type,
        f.params.height,
        f.params.radius,
        f.params.radiusBottom,
        f.params.width,
        f.params.depth,
        f.volume.toFixed(4),
        f.formula
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `geovol_data_${unit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
