import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Project, FigureData } from '../types';
import { Loader2, Plus, Trash2, Edit3, Calendar, Box, LogOut } from 'lucide-react';

interface DashboardProps {
    onOpenProject: (project: Project | null) => void;
    onLogout: () => void;
}

interface ProjectCardProps {
    project: Project;
    onOpen: (p: Project) => void;
    onDelete: (id: number, e: React.MouseEvent) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
    project, 
    onOpen, 
    onDelete 
}) => {
    const figureCount = project.data?.length || 0;
    const totalVolume = (project.data as FigureData[])?.reduce((acc, curr) => acc + curr.volume, 0) || 0;

    return (
        <div 
            onClick={() => onOpen(project)}
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
        >
            <div className="h-32 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                    <Box className="text-slate-300 w-12 h-12" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
            
            <div className="p-4">
                <h3 className="font-bold text-slate-800 truncate mb-1">{project.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5em] mb-3">
                    {project.description || 'Sin descripción'}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                        <Box size={12} /> {figureCount} Figs
                    </span>
                    <span className="flex items-center gap-1">
                        Vol: {totalVolume.toFixed(2)}
                    </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <button 
                        onClick={(e) => onDelete(project.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onOpenProject, onLogout }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
        
        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Mis Proyectos</h1>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* New Project Card */}
                        <div 
                            onClick={() => onOpenProject(null)}
                            className="bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center h-full min-h-[280px] cursor-pointer hover:border-accent hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-100 text-accent rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Plus size={24} strokeWidth={3} />
                            </div>
                            <span className="font-semibold text-slate-600 group-hover:text-accent">Nuevo Proyecto</span>
                        </div>

                        {projects.map(p => (
                            <ProjectCard 
                                key={p.id} 
                                project={p} 
                                onOpen={onOpenProject} 
                                onDelete={handleDelete} 
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
