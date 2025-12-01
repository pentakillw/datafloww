import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Mail, Loader2, ArrowRight, Lock, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle entre Login y Registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        // --- REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
        setIsSignUp(false); // Cambiar a login para que el usuario entre
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/'); // Redirigir al Dashboard si es exitoso
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-persian via-sea to-purple-500"></div>
      
      <div className="w-full max-w-md bg-carbon-light border border-wolf/10 rounded-2xl p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-persian/10 mb-4 text-persian transition-transform hover:scale-110 duration-300">
            <Database size={32} />
          </div>
          <h1 className="text-2xl font-bold text-zinc font-mono tracking-tight">DataFlow Pro</h1>
          <p className="text-wolf text-sm mt-2">
            {isSignUp ? 'Crea tu cuenta profesional' : 'Bienvenido de nuevo'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-wolf uppercase mb-2 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-wolf/50 group-focus-within:text-persian transition-colors" size={20} />
              <input 
                type="email" 
                required
                placeholder="name@company.com"
                className="w-full bg-black/20 border border-wolf/20 rounded-lg py-3 pl-10 pr-4 text-zinc focus:outline-none focus:border-persian focus:ring-1 focus:ring-persian transition-all font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-wolf uppercase mb-2 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-wolf/50 group-focus-within:text-persian transition-colors" size={20} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-black/20 border border-wolf/20 rounded-lg py-3 pl-10 pr-4 text-zinc focus:outline-none focus:border-persian focus:ring-1 focus:ring-persian transition-all font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="text-red-400 text-xs bg-red-900/10 p-3 rounded border border-red-900/20 flex items-center gap-2 animate-in slide-in-from-left-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          {/* Botón de Acción Principal */}
          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-persian to-sea hover:from-sea hover:to-persian text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-persian/20 hover:shadow-persian/40 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : (isSignUp ? <UserPlus size={18} className="mr-2"/> : <LogIn size={18} className="mr-2"/>)}
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <p className="text-wolf text-xs">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
              className="ml-2 text-persian hover:text-white font-bold underline decoration-2 underline-offset-4 transition-colors"
            >
              {isSignUp ? 'Inicia Sesión' : 'Regístrate Gratis'}
            </button>
          </p>
        </div>

      </div>
      
      <div className="absolute bottom-4 text-wolf/20 text-xs font-mono">
        System Ready v.2.0.0
      </div>
    </div>
  );
}