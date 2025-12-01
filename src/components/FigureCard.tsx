import React from 'react';
import { FigureData, FigureType } from '../types';
import { Trash2, Minus, Plus } from 'lucide-react';

interface FigureCardProps {
  figure: FigureData;
  index: number;
  unit: string;
  onUpdate: (id: number, field: string, value: number) => void;
  onDelete: (id: number) => void;
}

// Extracted component to prevent re-mounting and focus loss
const SmartInput = ({ label, field, value, unit, onUpdate, figureId }: { 
    label: string, 
    field: string, 
    value: number, 
    unit: string, 
    onUpdate: (id: number, field: string, value: number) => void,
    figureId: number
}) => {
    const isValid = value > 0;
    
    const handleChange = (newValueStr: string) => {
        const numValue = parseFloat(newValueStr);
        if (newValueStr === '') {
             onUpdate(figureId, field, 0); 
             return;
        }
        if (!isNaN(numValue)) {
            onUpdate(figureId, field, numValue);
        }
    };

    const adjustValue = (amount: number) => {
        const newValue = Math.max(0.1, parseFloat((value + amount).toFixed(2)));
        onUpdate(figureId, field, newValue);
    };

    return (
        <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">{label} ({unit})</label>
            <div className={`flex items-center bg-slate-50 border rounded-md transition-all group-focus-within:ring-1 group-focus-within:ring-accent ${isValid ? 'border-slate-200' : 'border-red-300 bg-red-50'}`}>
                <button 
                    onClick={() => adjustValue(-0.5)}
                    className="p-2 text-slate-400 hover:text-accent hover:bg-slate-100 rounded-l-md transition-colors active:bg-slate-200"
                    title="Disminuir"
                    tabIndex={-1}
                >
                    <Minus size={12} strokeWidth={3} />
                </button>
                <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={value === 0 ? '' : value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full bg-transparent text-center text-sm font-semibold text-primary focus:outline-none py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                    onClick={() => adjustValue(0.5)}
                    className="p-2 text-slate-400 hover:text-accent hover:bg-slate-100 rounded-r-md transition-colors active:bg-slate-200"
                    title="Aumentar"
                    tabIndex={-1}
                >
                    <Plus size={12} strokeWidth={3} />
                </button>
            </div>
            {!isValid && <span className="text-[9px] text-red-500 mt-0.5 text-center">Inválido</span>}
        </div>
    );
};

export const FigureCard: React.FC<FigureCardProps> = ({ figure, index, unit, onUpdate, onDelete }) => {
  return (
    <div className="group bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative mb-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded">#{index + 1}</span>
          <h4 className="font-semibold text-primary text-sm">{figure.type}</h4>
        </div>
        <button 
          onClick={() => onDelete(figure.id)}
          className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors p-1.5"
          aria-label="Eliminar figura"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {(figure.type !== FigureType.Sphere) && (
            <SmartInput label="Altura" field="height" value={figure.params.height} unit={unit} onUpdate={onUpdate} figureId={figure.id} />
        )}
        
        {(figure.type === FigureType.Cylinder || figure.type === FigureType.Cone || figure.type === FigureType.TruncatedCone || figure.type === FigureType.Sphere) && (
             <SmartInput label="Radio" field="radius" value={figure.params.radius} unit={unit} onUpdate={onUpdate} figureId={figure.id} />
        )}

        {figure.type === FigureType.TruncatedCone && (
             <SmartInput label="Radio Inf." field="radiusBottom" value={figure.params.radiusBottom} unit={unit} onUpdate={onUpdate} figureId={figure.id} />
        )}

        {figure.type === FigureType.Pyramid && (
            <SmartInput label="Lado Base" field="width" value={figure.params.width} unit={unit} onUpdate={onUpdate} figureId={figure.id} />
        )}

        {figure.type === FigureType.RectangularPrism && (
            <>
                <SmartInput label="Ancho" field="width" value={figure.params.width} unit={unit} onUpdate={onUpdate} figureId={figure.id} />
                <SmartInput label="Profundidad" field="depth" value={figure.params.depth} unit={unit} onUpdate={onUpdate} figureId={figure.id} />
            </>
        )}
      </div>

      <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs">
        <span className="text-secondary font-mono truncate max-w-[60%] opacity-80" title={figure.formula}>{figure.formula}</span>
        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{figure.volume.toFixed(3)} {unit}³</span>
      </div>
    </div>
  );
};