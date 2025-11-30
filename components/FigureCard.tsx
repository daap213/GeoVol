import React from 'react';
import { FigureData, FigureType } from '../types';
import { Trash2 } from 'lucide-react'; // Assuming lucide-react is available, or we use SVG

interface FigureCardProps {
  figure: FigureData;
  index: number;
  unit: string;
  onUpdate: (id: number, field: string, value: number) => void;
  onDelete: (id: number) => void;
}

export const FigureCard: React.FC<FigureCardProps> = ({ figure, index, unit, onUpdate, onDelete }) => {
  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdate(figure.id, field, numValue);
    }
  };

  const InputField = ({ label, field, value }: { label: string, field: string, value: number }) => (
    <div className="flex flex-col">
      <label className="text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">{label} ({unit})</label>
      <input
        type="number"
        step="0.1"
        min="0.1"
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
      />
    </div>
  );

  return (
    <div className="group bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative mb-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded">#{index + 1}</span>
          <h4 className="font-semibold text-primary text-sm">{figure.type}</h4>
        </div>
        <button 
          onClick={() => onDelete(figure.id)}
          className="text-slate-300 hover:text-red-500 transition-colors p-1"
          aria-label="Eliminar figura"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {(figure.type !== FigureType.Sphere) && (
            <InputField label="Altura" field="height" value={figure.params.height} />
        )}
        
        {(figure.type === FigureType.Cylinder || figure.type === FigureType.Cone || figure.type === FigureType.TruncatedCone || figure.type === FigureType.Sphere) && (
             <InputField label="Radio" field="radius" value={figure.params.radius} />
        )}

        {figure.type === FigureType.TruncatedCone && (
             <InputField label="Radio Inf." field="radiusBottom" value={figure.params.radiusBottom} />
        )}

        {figure.type === FigureType.Pyramid && (
            <InputField label="Lado Base" field="width" value={figure.params.width} />
        )}

        {figure.type === FigureType.RectangularPrism && (
            <>
                <InputField label="Ancho" field="width" value={figure.params.width} />
                <InputField label="Profundidad" field="depth" value={figure.params.depth} />
            </>
        )}
      </div>

      <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs">
        <span className="text-secondary font-mono truncate max-w-[60%]">{figure.formula}</span>
        <span className="font-bold text-emerald-600">{figure.volume.toFixed(3)} {unit}³</span>
      </div>
    </div>
  );
};