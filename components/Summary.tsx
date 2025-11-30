import React from 'react';
import { FigureData } from '../types';
import { getFigureHeight } from '../utils';

export const Summary: React.FC<{ figures: FigureData[]; unit: string }> = ({ figures, unit }) => {
  const totalVolume = figures.reduce((acc, f) => acc + f.volume, 0);
  const totalHeight = figures.reduce((acc, f) => acc + getFigureHeight(f.type, f.params), 0);
  
  const formulaString = figures.length > 0 
    ? figures.map(f => `(${f.formula})`).join(' + ')
    : '-';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-primary mb-4">Resumen del Objeto</h2>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[150px] bg-emerald-50 border border-emerald-100 rounded-lg p-4">
          <div className="text-emerald-700 text-xs font-bold uppercase tracking-wide mb-1">Volumen Total</div>
          <div className="text-2xl font-bold text-emerald-800">{totalVolume.toFixed(3)} <span className="text-base font-normal text-emerald-600">{unit}³</span></div>
        </div>
        
        <div className="flex-1 min-w-[150px] bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="text-blue-700 text-xs font-bold uppercase tracking-wide mb-1">Altura Total</div>
          <div className="text-2xl font-bold text-blue-800">{totalHeight.toFixed(2)} <span className="text-base font-normal text-blue-600">{unit}</span></div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Fórmula Final</div>
        <div className="font-mono text-sm text-slate-700 break-words leading-relaxed">
           V<sub>total</sub> = {formulaString}
        </div>
      </div>
    </div>
  );
};