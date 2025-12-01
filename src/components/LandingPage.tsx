import React from 'react';
import { Box, Calculator, Layers, ArrowRight, Cuboid } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
         <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
            <div className="bg-accent text-white p-1.5 rounded-lg">
                <Cuboid size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">GeoVol <span className="text-accent">3D</span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 z-10 mt-8 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="text-sm font-semibold text-accent flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                v2.0 - Motor Físico Integrado
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            Calculadora de Volúmenes <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Geometría Interactiva</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Construye objetos compuestos capa por capa, visualízalos en un entorno 3D en tiempo real y obtén cálculos precisos de volumen, masa y peso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-primary text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3 overflow-hidden"
            >
                <span className="relative z-10">Comenzar Ahora</span>
                <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
            <FeatureCard 
                icon={<Box className="text-blue-500" />}
                title="Modelado 3D Real"
                desc="Visualizador interactivo con Three.js. Rota, acerca y analiza tus figuras con etiquetas de medidas en tiempo real."
            />
            <FeatureCard 
                icon={<Layers className="text-emerald-500" />}
                title="Construcción por Capas"
                desc="Apila cilindros, cubos, conos y más. El sistema ajusta automáticamente la posición para crear objetos compuestos."
            />
            <FeatureCard 
                icon={<Calculator className="text-purple-500" />}
                title="Cálculos Físicos"
                desc="Obtén volumen total, masa y peso basándote en materiales reales como acero, madera u hormigón."
            />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2025 GeoVol 3D.</p>
            <p className="text-sm text-slate-400 font-medium">Diseñado por <span className="text-slate-600 font-semibold">Daniel Alvarado</span></p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);