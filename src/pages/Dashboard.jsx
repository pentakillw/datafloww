import React from 'react';
import { useData } from '../context/DataContext';
import { 
  UploadCloud, Database, Sparkles, Zap, BookOpen, 
  MonitorPlay, ArrowRight, FileSpreadsheet, Server,
  Activity, CheckCircle2, ChevronRight, Crown, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  // Usamos redirectToBilling
  const { data, actions, userTier, planLimits, filesUploadedCount, redirectToBilling } = useData();
  const totalRows = data.length;

  // Calculamos porcentaje de uso del plan
  const filesUsed = filesUploadedCount;
  const filesMax = planLimits.maxFiles;
  const usagePercent = Math.min(100, (filesUsed / filesMax) * 100);

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-auto h-full custom-scrollbar">
        
        {/* HERO BANNER - Ahora muestra el estado del plan */}
        <div className="relative bg-gradient-to-r from-persian via-sea to-purple-500 p-8 rounded-t-xl overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none">
             <Sparkles size={180} />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-black text-white tracking-tight">Hola, Analista</h1>
                 {userTier === 'pro' && <span className="bg-yellow-400/90 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Crown size={10} fill="currentColor"/> PRO</span>}
                 {userTier === 'free' && <span className="bg-gray-200/20 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/20">FREE</span>}
               </div>
               <p className="text-teal-100 text-lg max-w-xl leading-relaxed">
                 {userTier === 'free' 
                    ? 'Estás en el plan gratuito. Actualiza para eliminar límites y exportar código.' 
                    : 'Tienes acceso total a las herramientas de generación de código.'}
               </p>
             </div>

             {/* Tarjeta de Estado de Cuenta (Límites) */}
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 w-full md:w-64 text-white">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold uppercase opacity-80">Archivos Usados</span>
                   <span className="text-xs font-mono">{filesUsed} / {filesMax}</span>
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mb-3">
                   <div 
                     className={`h-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-400' : 'bg-green-400'}`} 
                     style={{ width: `${usagePercent}%` }}
                   ></div>
                </div>
                
                {userTier === 'free' && (
                  <button 
                    onClick={redirectToBilling}
                    className="w-full bg-white text-persian hover:bg-gray-100 text-xs font-bold py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
                  >
                    <Sparkles size={12} /> Actualizar a PRO
                  </button>
                )}
             </div>
           </div>
        </div>
        
        {/* Accesos Rápidos & Stats */}
        <div className="bg-gray-50 dark:bg-carbon-light px-8 py-4 border-b border-gray-200 dark:border-wolf/20 flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalRows > 0 ? 'bg-green-500/10 text-green-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                  <Database size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-wolf uppercase">Filas Cargadas</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc">{totalRows.toLocaleString()}</p>
                </div>
             </div>
             
             <div className="h-8 w-px bg-gray-200 dark:bg-wolf/10 hidden md:block"></div>

             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${actions.length > 0 ? 'bg-persian/10 text-persian' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-wolf uppercase">Acciones</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc">{actions.length} aplicadas</p>
                </div>
             </div>

             <div className="flex-1"></div>

             {data.length > 0 && (
                <button onClick={() => navigate('/transform')} className="bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg font-semibold flex items-center shadow-md transition-all text-sm animate-in slide-in-from-right">
                   <Zap size={16} className="mr-2" /> Continuar Transformando
                </button>
             )}
        </div>

        <div className="p-8">
            
            {/* SECCIÓN 2: GUÍAS CRÍTICAS */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc mb-6 flex items-center gap-2">
               <Server size={22} className="text-persian"/> Preparación del Entorno
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div 
                  onClick={() => navigate('/guide')}
                  className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30 relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                   <div className="absolute top-0 right-0 p-4 opacity-20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"><MonitorPlay size={80} /></div>
                   <div className="relative z-10">
                      <div className="p-3 bg-blue-500 text-white rounded-xl inline-block mb-4 shadow-md"><MonitorPlay size={28} /></div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">1. Guía de Ejecución</h3>
                      <p className="text-gray-600 dark:text-blue-100 text-sm mb-4 leading-relaxed">Prepara tu computadora con Python para ejecutar los scripts generados.</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-300 group-hover:underline">Ver pasos <ArrowRight size={16} /></div>
                   </div>
                </div>

                <div 
                  onClick={() => navigate('/docs')}
                  className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 p-6 rounded-2xl border border-purple-200 dark:border-purple-900/30 relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                   <div className="absolute top-0 right-0 p-4 opacity-20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><BookOpen size={80} /></div>
                   <div className="relative z-10">
                      <div className="p-3 bg-purple-500 text-white rounded-xl inline-block mb-4 shadow-md"><BookOpen size={28} /></div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2. Documentación</h3>
                      <p className="text-gray-600 dark:text-purple-100 text-sm mb-4 leading-relaxed">Catálogo completo de funciones de transformación y limpieza.</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-300 group-hover:underline">Explorar <ArrowRight size={16} /></div>
                   </div>
                </div>
            </div>

            {/* SECCIÓN 3: FLUJO */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc mb-6 flex items-center gap-2">
               <Zap size={22} className="text-persian"/> Flujo de Trabajo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard icon={<UploadCloud size={32} />} title="Cargar Datos" desc="Importa CSV o Excel." onClick={() => navigate('/data')} color="persian" active={data.length === 0} />
                <ActionCard icon={<Sparkles size={32} />} title="Transformar" desc="Limpia y estructura." onClick={() => navigate('/transform')} color="sea" active={data.length > 0 && actions.length === 0} disabled={data.length === 0} />
                <ActionCard icon={<FileSpreadsheet size={32} />} title="Exportar" desc="Descarga o automatiza." onClick={() => navigate('/export')} color="purple-500" active={actions.length > 0} disabled={data.length === 0} />
            </div>

        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, color, active, disabled }) {
  const colorClasses = {
    'persian': 'bg-persian text-white group-hover:shadow-persian/50',
    'sea': 'bg-sea text-white group-hover:shadow-sea/50',
    'purple-500': 'bg-purple-500 text-white group-hover:shadow-purple-500/50',
  };
  const textColors = { 'persian': 'text-persian', 'sea': 'text-sea', 'purple-500': 'text-purple-500' };

  return (
    <button onClick={onClick} disabled={disabled} className={`group text-left relative p-6 rounded-2xl border transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-carbon border-gray-200 dark:border-wolf/10' : 'bg-white dark:bg-carbon-light border-gray-200 dark:border-wolf/20 hover:border-transparent hover:shadow-xl hover:-translate-y-1 cursor-pointer'}`}>
       {active && <div className="absolute top-4 right-4"><span className="relative flex h-3 w-3"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${color}`}></span><span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}`}></span></span></div>}
       <div className={`p-4 rounded-xl inline-block mb-4 shadow-sm transition-shadow ${disabled ? 'bg-gray-200 dark:bg-wolf/10 text-gray-400' : colorClasses[color]}`}>{icon}</div>
       <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-zinc">{title}</h3>
       <p className={`text-sm leading-relaxed mb-4 ${disabled ? 'text-gray-400 dark:text-wolf/60' : 'text-gray-600 dark:text-wolf'}`}>{desc}</p>
       <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${disabled ? 'text-gray-400' : `${textColors[color]} group-hover:underline`}`}>{disabled ? 'Espera...' : 'Abrir'} <ChevronRight size={16} className={disabled ? '' : 'group-hover:translate-x-1 transition-transform'} /></div>
    </button>
  );
}