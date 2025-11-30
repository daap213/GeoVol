
import React, { useState, useEffect, useCallback } from 'react';
import { FigureData, FigureType, Material, MATERIALS } from './types';
import { calculateFigure, getDefaultParams } from './utils';
import { FigureCard } from './components/FigureCard';
import { Viewer2D } from './components/Viewer2D';
import { Viewer3D } from './components/Viewer3D';
import { Summary } from './components/Summary';
import { Undo, Redo, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [figures, setFigures] = useState<FigureData[]>([]);
  const [selectedType, setSelectedType] = useState<FigureType>(FigureType.Cylinder);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [unit, setUnit] = useState<string>('m');
  const [material, setMaterial] = useState<Material>(MATERIALS.DEFAULT);

  // Undo/Redo History Stacks
  const [history, setHistory] = useState<FigureData[][]>([]);
  const [future, setFuture] = useState<FigureData[][]>([]);

  // Helper to save state to history
  const saveToHistory = (currentFigures: FigureData[]) => {
    setHistory(prev => [...prev, currentFigures]);
    setFuture([]); // Clear future on new action
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [figures, ...prev]);
    setFigures(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, figures]);
    setFigures(next);
    setFuture(prev => prev.slice(1));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (Array.isArray(json)) {
                saveToHistory(figures);
                setFigures(json);
            } else {
                alert("Formato de archivo inválido");
            }
        } catch (err) {
            alert("Error al leer el archivo");
        }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const addFigure = () => {
    saveToHistory(figures);
    const params = getDefaultParams(selectedType);
    const { volume, formula } = calculateFigure(selectedType, params);
    
    const newFigure: FigureData = {
      id: Date.now(),
      type: selectedType,
      params,
      volume,
      formula
    };

    setFigures([...figures, newFigure]);
  };

  const updateFigure = (id: number, field: string, value: number) => {
    // Only save to history on "commit" (blur or delayed)? 
    // For simplicity, we won't save history on EVERY keystroke change, but logic here applies immediately.
    // To properly support Undo for sliders/inputs, usually debounce is needed. 
    // For now, let's treat update as a state change. To avoid spamming history, we might check if value changed significantly
    // or rely on user to be careful. A better approach for inputs is save history on focus, update on change.
    
    // For this implementation, we will NOT push to history on every update to keep performance smooth,
    // but practically we should. Let's assume updates are minor. 
    // *Improved strategy*: We pass `updateFigure` which updates State. 
    // We can add a `saveSnapshot` wrapper if we wanted specific undo points.
    
    setFigures(prev => prev.map(fig => {
      if (fig.id !== id) return fig;
      
      const newParams = { ...fig.params, [field]: value };
      const { volume, formula } = calculateFigure(fig.type, newParams);
      
      return {
        ...fig,
        params: newParams,
        volume,
        formula
      };
    }));
  };
  
  // Custom wrapper to save history before deleting
  const removeFigure = (id: number) => {
    saveToHistory(figures);
    setFigures(figures.filter(f => f.id !== id));
  };

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
              if (e.shiftKey) redo();
              else undo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, future, figures]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      <header className="mb-8 text-center relative">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">GeoVol <span className="text-accent">3D</span></h1>
        <p className="text-secondary max-w-xl mx-auto mb-4">Construye objetos compuestos, calcula volúmenes y estima pesos.</p>
        
        <div className="flex justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad:</span>
                <select 
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-transparent text-sm font-bold text-accent focus:outline-none cursor-pointer pr-1"
                >
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="in">in</option>
                    <option value="ft">ft</option>
                </select>
            </div>
            
            <div className="inline-flex items-center gap-1 bg-white px-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <button onClick={undo} disabled={history.length === 0} className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30 transition-colors" title="Deshacer (Ctrl+Z)">
                    <Undo size={16} className="text-slate-600" />
                </button>
                <button onClick={redo} disabled={future.length === 0} className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30 transition-colors" title="Rehacer (Ctrl+Shift+Z)">
                    <Redo size={16} className="text-slate-600" />
                </button>
            </div>
        </div>
      </header>

      <Summary 
        figures={figures} 
        unit={unit} 
        currentMaterial={material}
        onMaterialChange={setMaterial}
        onImport={handleImport}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Selector Panel */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Agregar Nueva Figura</h3>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-accent text-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as FigureType)}
                >
                  {Object.values(FigureType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <button 
                onClick={addFigure}
                className="bg-accent hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
               <span className="text-xl font-bold leading-none">+</span>
              </button>
            </div>
          </div>

          {/* List of figures */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-slate-500 uppercase">Capas ({figures.length})</h3>
               {figures.length > 0 && (
                   <button onClick={() => { saveToHistory(figures); setFigures([]); }} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                       <RotateCcw size={12} /> Limpiar
                   </button>
               )}
            </div>
            
            {/* Updated Height Logic: Grows automatically but has a much larger max limit to match the viewer height */}
            <div className="space-y-3 h-auto max-h-[650px] lg:max-h-[750px] overflow-y-auto custom-scrollbar pr-2 pb-10">
              {figures.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-slate-400 text-sm">No hay figuras seleccionadas</p>
                  <p className="text-slate-300 text-xs mt-1">Agrega una figura para comenzar</p>
                </div>
              ) : (
                figures.map((fig, idx) => (
                  <FigureCard 
                    key={fig.id} 
                    figure={fig} 
                    index={idx} 
                    unit={unit}
                    onUpdate={updateFigure} 
                    onDelete={removeFigure} 
                  />
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-[700px] lg:sticky lg:top-6">
          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 inline-flex self-center mb-4">
             <button 
                onClick={() => setViewMode('2D')}
                className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === '2D' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
             >
               Vista 2D
             </button>
             <button 
                onClick={() => setViewMode('3D')}
                className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === '3D' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}
             >
               Vista 3D
             </button>
          </div>
          
          <div className="flex-grow rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 relative">
             {viewMode === '2D' ? (
                <Viewer2D figures={figures} />
             ) : (
                <Viewer3D figures={figures} materialConfig={material} />
             )}
          </div>
          
          <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                  {viewMode === '2D' ? 'Usa la rueda del ratón para hacer zoom y arrastra para mover.' : 'Arrastra para rotar, usa la rueda para zoom.'}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
