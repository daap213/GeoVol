import React, { useState, useRef, useEffect } from 'react';
import { FigureType, FigureData, Material, MATERIALS, Project } from '../types';
import { FigureCard } from './FigureCard';
import { Viewer2D } from './Viewer2D';
import { Viewer3D, Viewer3DHandle } from './Viewer3D';
import { Summary } from './Summary';
import { useFigureManager } from '../hooks';
import { Undo, Redo, RotateCcw, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface EditorProps {
    initialProject: Project | Partial<Project> | null;
    onBack: () => void;
    session: any;
    onRequestAuth: (data: FigureData[]) => void;
}

export const Editor: React.FC<EditorProps> = ({ initialProject, onBack, session, onRequestAuth }) => {
  const [selectedType, setSelectedType] = useState<FigureType>(FigureType.Cylinder);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [unit, setUnit] = useState<string>('m');
  const [material, setMaterial] = useState<Material>(MATERIALS.DEFAULT);
  
  // Project Meta
  const [projectName, setProjectName] = useState(initialProject?.name || 'Nuevo Proyecto');
  const [isSaving, setIsSaving] = useState(false);

  const viewer3DRef = useRef<Viewer3DHandle>(null);

  const { 
      figures, addFigure, updateFigure, removeFigure, clearFigures, 
      undo, redo, canUndo, canRedo, loadFigures 
  } = useFigureManager();

  // Load initial data
  useEffect(() => {
      if (initialProject && initialProject.data) {
          loadFigures(initialProject.data);
      }
  }, [initialProject, loadFigures]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            
            // Handle Legacy Format (Array of Figures)
            if (Array.isArray(json)) {
                loadFigures(json);
            } 
            // Handle New Format (Object with figures, unit, material)
            else if (json.figures && Array.isArray(json.figures)) {
                loadFigures(json.figures);
                if (json.unit) setUnit(json.unit);
                if (json.material) setMaterial(json.material);
            } else {
                alert("Formato inválido");
            }
        } catch { alert("Error al leer archivo"); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveProject = async () => {
      // 1. GUEST CHECK
      if (!session) {
          // Immediately trigger auth request without blocking confirm dialog
          onRequestAuth(figures);
          return;
      }

      // 2. VALIDATION
      if (!projectName.trim()) {
          alert('Por favor ingresa un nombre para el proyecto');
          return;
      }

      setIsSaving(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No autenticado");

          let thumbnail = null;
          // Only capture if ref exists (might be null if user never opened 3D view)
          // Ideally user saves while looking at the object
          if (viewer3DRef.current) {
              thumbnail = viewer3DRef.current.captureScreenshot();
          }

          const projectData = {
              user_id: user.id,
              name: projectName,
              description: `${figures.length} figuras - ${material.name}`,
              data: figures,
              thumbnail: thumbnail,
              updated_at: new Date().toISOString()
          };

          if (initialProject?.id) {
              // Update existing
              const { error } = await supabase.from('projects').update(projectData).eq('id', initialProject.id);
              if (error) throw error;
          } else {
              // Create new
              const { error } = await supabase.from('projects').insert(projectData);
              if (error) throw error;
          }
          alert('Proyecto guardado correctamente');
          onBack(); 
      } catch (err: any) {
          console.error(err);
          alert('Error al guardar: ' + err.message);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="text-2xl font-bold text-primary bg-transparent border-b border-transparent hover:border-slate-300 focus:border-accent focus:outline-none transition-colors w-full md:w-80"
                    placeholder="Nombre del Proyecto"
                />
            </div>
            
            <div className="flex gap-3">
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad:</span>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-transparent text-sm font-bold text-accent focus:outline-none cursor-pointer pr-1">
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                        <option value="in">in</option>
                        <option value="ft">ft</option>
                    </select>
                </div>
                
                <div className="inline-flex items-center gap-1 bg-white px-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <button onClick={undo} disabled={!canUndo} className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30 transition-colors" title="Deshacer"><Undo size={16} /></button>
                    <button onClick={redo} disabled={!canRedo} className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30 transition-colors" title="Rehacer"><Redo size={16} /></button>
                </div>

                <button 
                    onClick={handleSaveProject} 
                    disabled={isSaving}
                    className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {session ? 'Guardar' : 'Guardar (Invitado)'}
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
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Agregar Nueva Figura</h3>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-accent text-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as FigureType)}
                >
                  {Object.values(FigureType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <button onClick={() => addFigure(selectedType)} className="bg-accent hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
               <span className="text-xl font-bold leading-none">+</span>
              </button>
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-slate-500 uppercase">Capas ({figures.length})</h3>
               {figures.length > 0 && (
                   <button onClick={clearFigures} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                       <RotateCcw size={12} /> Limpiar
                   </button>
               )}
            </div>
            
            <div className="space-y-3 h-auto max-h-[650px] lg:max-h-[750px] overflow-y-auto custom-scrollbar pr-2 pb-10">
              {figures.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-slate-400 text-sm">No hay figuras seleccionadas</p>
                </div>
              ) : (
                figures.map((fig, idx) => (
                  <FigureCard key={fig.id} figure={fig} index={idx} unit={unit} onUpdate={updateFigure} onDelete={removeFigure} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-[700px] lg:sticky lg:top-6">
          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 inline-flex self-center mb-4">
             <button onClick={() => setViewMode('2D')} className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === '2D' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}>Vista 2D</button>
             <button onClick={() => setViewMode('3D')} className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === '3D' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-50'}`}>Vista 3D</button>
          </div>
          
          <div className="flex-grow rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 relative">
             {viewMode === '2D' ? 
                <Viewer2D figures={figures} /> : 
                <Viewer3D ref={viewer3DRef} figures={figures} materialConfig={material} />
             }
             {viewMode === '3D' && (
                 <div className="absolute bottom-4 left-4 text-[10px] text-slate-400 bg-white/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                     Guarda en esta vista para generar miniatura
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};