
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

interface AuthProps {
    onSuccess: () => void;
    onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onSuccess();
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Registro exitoso! Por favor inicia sesión.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-slate-100 relative">
                
                <button 
                    onClick={onBack}
                    className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 transition-colors p-1 -ml-2 rounded-full hover:bg-slate-50"
                    title="Volver"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-slate-500">
                        {isLogin ? 'Accede a tus proyectos guardados' : 'Empieza a modelar en 3D gratis'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                placeholder="usuario@ejemplo.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-accent hover:underline font-medium"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};
