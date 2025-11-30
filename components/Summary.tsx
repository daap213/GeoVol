
import React from 'react';
import { FigureData, Material, MATERIALS } from '../types';
import { getFigureHeight, calculateMass, formatMass, formatForce, exportToCSV } from '../utils';
import { Download, Upload, Scale, Weight, Settings } from 'lucide-react';

interface SummaryProps {
    figures: FigureData[];
    unit: string;
    currentMaterial: Material;
    onMaterialChange: (m: Material) => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Summary: React.FC<SummaryProps> = ({ figures, unit, currentMaterial, onMaterialChange, onImport }) => {
  const totalVolume = figures.reduce((acc, f) => acc + f.volume, 0);
  const totalHeight = figures.reduce((acc, f) => acc + getFigureHeight(f.type, f.params), 0);
  
  // Physics calculations
  const totalMassKg = calculateMass(totalVolume, currentMaterial.density, unit);
  const totalWeightNewton = totalMassKg * 9.81; // F = m * g

  const formulaString = figures.length > 0 
    ? figures.map(f => `(${f.formula})`).join(' + ')
    : '-';

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(figures));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "geovol_project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
          onMaterialChange({ ...currentMaterial, density: val });
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
        <h2 className="text-lg font-semibold text-primary">Resumen del Objeto</h2>
        
        <div className="flex gap-2">
            <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600">
                <Upload size={14} />
                <span>Importar JSON</span>
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button onClick={handleExportJSON} className="px-3 py-1 hover:bg-white rounded-md text-xs font-semibold text-slate-600 transition-colors flex items-center gap-1" title="Guardar Proyecto">
                    <Download size={14} /> JSON
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button onClick={() => exportToCSV(figures, unit)} className="px-3 py-1 hover:bg-white rounded-md text-xs font-semibold text-slate-600 transition-colors flex items-center gap-1" title="Exportar Excel">
                    <Download size={14} /> CSV
                </button>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 relative overflow-hidden">
          <div className="text-emerald-700 text-xs font-bold uppercase tracking-wide mb-1">Volumen Total</div>
          <div className="text-2xl font-bold text-emerald-800">{totalVolume.toFixed(3)} <span className="text-base font-normal text-emerald-600">{unit}³</span></div>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="text-blue-700 text-xs font-bold uppercase tracking-wide mb-1">Altura Total</div>
          <div className="text-2xl font-bold text-blue-800">{totalHeight.toFixed(2)} <span className="text-base font-normal text-blue-600">{unit}</span></div>
        </div>

        {/* Masa y Peso combinados en un bloque más ancho o dividido */}
        <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between relative">
            {/* Header del panel de física */}
           <div className="flex justify-between items-start mb-2 border-b border-slate-200 pb-2">
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                   Propiedades Físicas
               </div>
               <select 
                value={Object.keys(MATERIALS).find(key => MATERIALS[key].name === currentMaterial.name) || 'DEFAULT'}
                onChange={(e) => onMaterialChange(MATERIALS[e.target.value])}
                className="text-xs border-none bg-transparent font-semibold text-accent focus:ring-0 cursor-pointer text-right p-0"
               >
                   {Object.entries(MATERIALS).map(([key, mat]) => (
                       <option key={key} value={key}>{mat.name}</option>
                   ))}
               </select>
           </div>
           
           <div className="flex justify-between items-end gap-4">
                {/* Masa */}
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                        <Scale size={14} />
                        <span className="text-[10px] uppercase font-semibold">Masa</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{formatMass(totalMassKg)}</div>
                </div>

                {/* Separador vertical */}
                <div className="w-px h-8 bg-slate-200"></div>

                {/* Peso (Fuerza) */}
                <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-slate-500 mb-0.5">
                        <span className="text-[10px] uppercase font-semibold">Peso (Fuerza)</span>
                        <Weight size={14} />
                    </div>
                    <div className="text-xl font-bold text-slate-800">{formatForce(totalWeightNewton)}</div>
                </div>
           </div>

            {currentMaterial.name === 'Personalizado' && (
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Densidad (kg/m³):</span>
                    <input 
                        type="number" 
                        value={currentMaterial.density} 
                        onChange={handleDensityChange}
                        className="w-24 text-xs text-right text-slate-800 bg-white border border-slate-300 rounded px-1.5 py-0.5 focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                    />
                </div>
            )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Fórmula Final</div>
        <div className="font-mono text-xs sm:text-sm text-slate-700 break-words leading-relaxed select-all">
           V<sub>total</sub> = {formulaString}
        </div>
      </div>
    </div>
  );
};
