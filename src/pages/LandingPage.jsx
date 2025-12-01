import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Database, Sparkles, Zap, Wand2, LayoutDashboard, 
  ArrowRight, FileSpreadsheet, Code2, Download, 
  CheckCircle2, XCircle, ArrowRightLeft, Split, Search
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <div className="bg-teal-500 p-1.5 rounded-lg text-white"><Database size={20} /></div>
            DATA<span className="text-teal-500">FLOW</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition-colors">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg shadow-teal-500/20 transition-all active:scale-95">
              Comenzar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 border border-teal-500/20">
          <Sparkles size={12} /> ETL No-Code para Humanos
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
          Limpia tus Excel <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">sin saber programar.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Sube archivos desordenados, aplica reglas de limpieza con clics y exporta el resultado limpio o el 
          <span className="font-mono text-teal-500 bg-teal-500/10 px-1 mx-1 rounded text-base">script de Python</span> 
          para automatizarlo siempre.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/login')} className="px-8 py-4 text-lg font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
            Probar Ahora <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-teal-500 hover:text-teal-500 transition-all">
            Ver Demo en Video
          </button>
        </div>
      </header>

      {/* --- VISUAL DEMO: BEFORE & AFTER --- */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">¿Datos sucios? No hay problema.</h2>
            <p className="text-slate-500 dark:text-slate-400">Detectamos errores comunes y los corregimos al instante.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* TABLA SUCIA */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-red-200 dark:border-red-900/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-red-500 flex items-center gap-2"><XCircle size={14}/> ANTES (Caos)</span>
              </div>
              <div className="p-4 space-y-3 opacity-70">
                <div className="flex gap-2 text-sm font-mono text-slate-400 border-b border-dashed pb-2">
                  <span className="w-1/3">Nombre</span>
                  <span className="w-1/3">Email</span>
                  <span className="w-1/3">Venta</span>
                </div>
                <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1/3">juan perez </span>
                  <span className="w-1/3">juan@gmai...</span>
                  <span className="w-1/3">100</span>
                </div>
                <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 bg-red-50 dark:bg-red-900/10 -mx-4 px-4 py-1">
                  <span className="w-1/3">juan perez</span>
                  <span className="w-1/3">NULL</span>
                  <span className="w-1/3">NULL</span>
                </div>
                <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1/3">MARIA G.</span>
                  <span className="w-1/3">maria@hotmail</span>
                  <span className="w-1/3">$ 2,500.00</span>
                </div>
              </div>
            </div>

            {/* FLECHA */}
            <div className="hidden md:flex justify-center text-teal-500">
              <Sparkles size={40} className="animate-pulse"/>
            </div>

            {/* TABLA LIMPIA */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-teal-200 dark:border-teal-900/30 overflow-hidden relative transform md:scale-105 transition-transform">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-teal-50 dark:bg-teal-900/10">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2"><CheckCircle2 size={14}/> DESPUÉS (DataFlow)</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2 text-sm font-mono text-slate-400 border-b border-dashed pb-2">
                  <span className="w-1/3">Nombre</span>
                  <span className="w-1/3">Email</span>
                  <span className="w-1/3">Venta</span>
                </div>
                <div className="flex gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <span className="w-1/3">Juan Perez</span>
                  <span className="w-1/3">juan@gmail.com</span>
                  <span className="w-1/3">100.00</span>
                </div>
                <div className="flex gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                   {/* Fila eliminada visualmente o corregida */}
                  <span className="w-1/3">Maria G.</span>
                  <span className="w-1/3">maria@hotmail.com</span>
                  <span className="w-1/3">2500.00</span>
                </div>
                 <div className="mt-2 text-xs text-teal-600 dark:text-teal-400 flex gap-2">
                    <span className="bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded">Title Case</span>
                    <span className="bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded">Duplicados Fuera</span>
                    <span className="bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded">Numérico</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-16 dark:text-white">
          Tu flujo de trabajo en <span className="text-teal-500">3 pasos</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            icon={<FileSpreadsheet size={32} />}
            step="01"
            title="Sube tu Archivo"
            desc="Arrastra tu CSV o Excel gigante. Nuestro motor carga millones de filas en segundos sin colgar tu navegador."
          />
          <StepCard 
            icon={<Wand2 size={32} />}
            step="02"
            title="Transforma Visualmente"
            desc="Usa el menú de clic derecho para limpiar nulos, separar nombres, calcular fórmulas y filtrar datos."
          />
          <StepCard 
            icon={<Code2 size={32} />}
            step="03"
            title="Exporta Código o Datos"
            desc="Descarga el archivo limpio o genera automáticamente el script de Python para no volver a hacer esto manualmente."
          />
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-20 bg-slate-50 dark:bg-[#161b22] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Todo lo que necesitas para ETL</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FeatureItem icon={<ArrowRightLeft />} label="Unir Columnas" />
            <FeatureItem icon={<Split />} label="Dividir Texto" />
            <FeatureItem icon={<Search />} label="Filtrado Avanzado" />
            <FeatureItem icon={<Zap />} label="Eliminar Nulos" />
            <FeatureItem icon={<LayoutDashboard />} label="Tablas Pivote (Agrupar)" />
            <FeatureItem icon={<Download />} label="Generador SQL" />
            <FeatureItem icon={<Code2 />} label="App Python (Tkinter)" />
            <FeatureItem icon={<Database />} label="Soporte 1M+ Filas" />
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Database size={200} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">¿Listo para dejar de sufrir con Excel?</h2>
          <p className="text-teal-100 mb-8 text-lg relative z-10">
            Únete a la nueva era de la limpieza de datos. Es gratis empezar.
          </p>
          <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white text-teal-900 font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-xl relative z-10">
            Crear Cuenta Gratis
          </button>
        </div>
      </section>

      {/* --- FOOTER CON ENLACES LEGALES --- */}
      <footer className="py-8 text-center bg-white dark:bg-[#0f1115] border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-600">
          <p>© 2025 DataFlow Pro. Construido para analistas modernos.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-teal-500 transition-colors">Términos y Condiciones</Link>
            <Link to="/privacy" className="hover:text-teal-500 transition-colors">Aviso de Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ icon, step, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-teal-500/50 transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-4xl font-black text-slate-100 dark:text-white/5">{step}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

function FeatureItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 hover:border-teal-500/30 transition-colors">
      <div className="text-teal-500">{icon}</div>
      <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{label}</span>
    </div>
  );
}