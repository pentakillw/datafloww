import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Sparkles, Zap, Wand2, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500/30">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <div className="bg-teal-500 p-1.5 rounded-lg text-white"><Database size={20} /></div>
          DATA<span className="text-teal-500">FLOW</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition-colors">
            Iniciar Sesión
          </button>
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg shadow-teal-500/20 transition-all active:scale-95">
            Comenzar Gratis
          </button>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto text-center pt-20 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 border border-teal-500/20">
          <Sparkles size={12} /> Nueva Versión 2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
          Tus datos, limpios <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">en segundos.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Deja de perder horas en Excel. Transforma, limpia y exporta millones de filas con nuestra herramienta No-Code. Interfaz optimizada para máxima productividad.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/login')} className="px-8 py-4 text-lg font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
            Probar Demo <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-teal-500 hover:text-teal-500 transition-all">
            Ver Tutorial
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-[#161b22] py-24 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <Zap size={32} />, title: "Ultrarrápido", desc: "Motor optimizado para procesar CSVs gigantes sin lag en el navegador." },
            { icon: <Wand2 size={32} />, title: "Auto-Limpieza", desc: "Detecta errores, nulos y duplicados automáticamente con un clic." },
            { icon: <LayoutDashboard size={32} />, title: "Espacio Zen", desc: "Interfaz colapsable diseñada para darte el máximo espacio de trabajo." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-teal-500/50 transition-colors group">
              <div className="text-teal-500 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}