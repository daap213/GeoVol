import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Project, FigureData } from './types';
import { Loader2 } from 'lucide-react';

type ViewState = 'LANDING' | 'AUTH' | 'DASHBOARD' | 'EDITOR';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [session, setSession] = useState<any>(null);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [pendingData, setPendingData] = useState<FigureData[] | null>(null); // Store guest work here
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => {
      if (session) {
          setView('DASHBOARD');
      } else {
          // GUEST MODE: Go directly to Editor without Auth
          setCurrentProject(null);
          setView('EDITOR');
      }
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setView('LANDING');
      setCurrentProject(null);
  };

  const handleOpenProject = (project: Project | null) => {
      setCurrentProject(project);
      setView('EDITOR');
  };

  // Called when Guest clicks "Save" in Editor
  const handleGuestSaveRequest = (data: FigureData[]) => {
      setPendingData(data); // Backup work
      setView('AUTH'); // Force login
  };

  const handleAuthSuccess = () => {
      if (pendingData) {
          // Restore guest work into a new project draft
          setCurrentProject({
              name: 'Mi Proyecto (Borrador)',
              data: pendingData
          });
          setPendingData(null); // Clear backup
          setView('EDITOR'); // Go back to finish saving
      } else {
          setView('DASHBOARD');
      }
  };

  return (
      <>
        {loading ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-accent" size={32} /></div>
        ) : (
            <>
                {view === 'LANDING' && <LandingPage onStart={handleStart} />}
                
                {view === 'AUTH' && (
                    <Auth 
                        onSuccess={handleAuthSuccess} 
                        onBack={() => {
                            if (pendingData) {
                                // If guest cancels auth, go back to editor with their pending work
                                setCurrentProject({
                                    name: 'Borrador',
                                    data: pendingData
                                });
                                setPendingData(null);
                                setView('EDITOR');
                            } else {
                                setView('LANDING');
                            }
                        }}
                    />
                )}
                
                {view === 'DASHBOARD' && <Dashboard onOpenProject={handleOpenProject} onLogout={handleLogout} />}
                
                {view === 'EDITOR' && (
                    <Editor 
                        session={session}
                        initialProject={currentProject} 
                        onBack={() => setView(session ? 'DASHBOARD' : 'LANDING')} 
                        onRequestAuth={handleGuestSaveRequest}
                    />
                )}
            </>
        )}
      </>
  );
};

export default App;