import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Mail, Loader2, ArrowRight, Lock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        <button onClick={() => navigate('/landing')} className="text-slate-400 hover:text-teal-500 mb-6 flex items-center gap-2 text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Volver al inicio
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 mb-4 text-teal-500">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Bienvenido</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Accede a DataFlow Pro</p>
        </div>

        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-sans"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Enviar Magic Link'} 
              {!loading && <ArrowRight size={18} className="ml-2" />}
            </button>
          </form>
        ) : (
          <div className="text-center p-6 bg-teal-500/10 rounded-lg border border-teal-500/20 animate-in fade-in">
            <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-2">¡Enlace Enviado!</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">Revisa tu correo <strong>{email}</strong> y haz clic en el enlace para entrar.</p>
            <button onClick={() => setSent(false)} className="mt-4 text-xs text-slate-500 hover:text-teal-500 underline">Intentar con otro correo</button>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 text-slate-400/50 text-xs font-mono">
        System Ready v.2.0.0
      </div>
    </div>
  );
}