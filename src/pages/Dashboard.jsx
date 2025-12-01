import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Plus, UploadCloud, PlayCircle, FolderOpen, Clock, Activity, 
  ArrowRight, FileText, Database, Sparkles, Zap, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, columns, actions } = useData();

  // Cálculo de estadísticas reales basadas en tu contexto
  const totalRows = data.length;
  const totalCols = columns.length;
  const totalActions = actions.length;
  
  const stats = [
    { 
      title: 'Filas Cargadas', 
      value: totalRows.toLocaleString(), 
      icon: <Database size={20} />, 
      color: 'text-persian', 
      bg: 'bg-persian/10',
      trend: data.length > 0 ? 'Dataset activo' : 'Esperando datos'
    },
    { 
      title: 'Columnas', 
      value: totalCols, 
      icon: <FileText size={20} />, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10',
      trend: 'Estructura actual'
    },
    { 
      title: 'Transformaciones', 
      value: totalActions, 
      icon: <Zap size={20} />, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10',
      trend: 'En esta sesión'
    },
  ];

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-auto h-full p-6 md:p-8 custom-scrollbar">
        
        {/* Header de Bienvenida */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-wolf mt-1">Resumen de tu espacio de trabajo actual.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => navigate('/data')}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-wolf/10 text-gray-700 dark:text-zinc px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <UploadCloud size={18} /> Cargar Datos
              </button>
              <button 
                onClick={() => navigate('/transform')}
                className="bg-persian hover:bg-sea text-white px-5 py-2 rounded-lg font-semibold flex items-center shadow-lg shadow-persian/20 transition-all active:scale-95"
              >
                <Sparkles size={18} className="mr-2" /> Ir al Estudio
              </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas (Ahora con datos reales) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-carbon-light p-6 rounded-xl border border-gray-200 dark:border-wolf/20 shadow-sm hover:border-persian/30 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                 {React.cloneElement(stat.icon, { size: 64 })}
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                 <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                 </div>
                 <span className="text-xs font-medium bg-white dark:bg-white/5 px-2 py-1 rounded-full text-gray-500 dark:text-wolf border border-gray-100 dark:border-white/5">
                    {stat.trend}
                 </span>
              </div>
              
              <div className="mt-4 relative z-10">
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-zinc">{stat.value}</h3>
                 <p className="text-sm font-medium text-gray-500 dark:text-wolf mt-1">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Actividad y Banner (2/3 del ancho) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Banner Hero */}
                <div className="bg-gradient-to-r from-persian/20 to-purple-500/10 rounded-2xl p-6 border border-persian/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Comienza a transformar datos</h3>
                        <p className="text-gray-600 dark:text-gray-300 max-w-lg mb-6 text-sm leading-relaxed">
                            DataFlow Pro te permite limpiar, filtrar y enriquecer tus datasets en segundos. 
                            Utiliza nuestras herramientas de IA para detectar anomalías automáticamente.
                        </p>
                        <button onClick={() => navigate('/data')} className="text-persian dark:text-white font-bold text-sm hover:underline flex items-center gap-1">
                            Comenzar ahora <ArrowRight size={16}/>
                        </button>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Activity size={180} />
                    </div>
                </div>

                {/* Feed de Actividad Reciente */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-zinc mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-persian"/> Actividad Reciente
                    </h3>
                    <div className="bg-gray-50 dark:bg-carbon-light rounded-xl border border-gray-200 dark:border-wolf/20 overflow-hidden">
                        {actions.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 dark:text-wolf">
                                <p className="text-sm">No hay actividad registrada en esta sesión.</p>
                                <p className="text-xs opacity-70 mt-1">Realiza transformaciones para verlas aquí.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-wolf/10">
                                {actions.slice(0, 5).map((action, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-white dark:hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-wolf">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-zinc">{action.type}</p>
                                            <p className="text-xs text-gray-500 dark:text-wolf truncate max-w-md">{action.description}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-black/30 px-2 py-1 rounded whitespace-nowrap">
                                            {action.timestamp}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {actions.length > 0 && (
                            <div className="p-3 bg-gray-100 dark:bg-white/5 text-center border-t border-gray-200 dark:border-wolf/10">
                                <button onClick={() => navigate('/transform')} className="text-xs font-bold text-persian hover:text-sea">Ir al Historial Completo</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Accesos Rápidos (1/3 del ancho) */}
            <div className="flex flex-col gap-6">
                <div className="bg-gray-50 dark:bg-carbon-light rounded-xl border border-gray-200 dark:border-wolf/20 p-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-zinc mb-4 uppercase tracking-wider">Accesos Rápidos</h3>
                    <div className="space-y-2">
                        <QuickLink icon={<UploadCloud size={16} />} label="Importar CSV/Excel" onClick={() => navigate('/data')} />
                        <QuickLink icon={<Database size={16} />} label="Gestionar Fuentes" onClick={() => {}} />
                        <QuickLink icon={<PlayCircle size={16} />} label="Ver Tutoriales" onClick={() => {}} />
                        <QuickLink icon={<FolderOpen size={16} />} label="Mis Proyectos" onClick={() => {}} />
                    </div>
                </div>

                <div className="bg-persian/5 rounded-xl border border-persian/20 p-5">
                    <h3 className="text-sm font-bold text-persian mb-2 flex items-center gap-2">
                        <Sparkles size={16}/> Novedades v2.0
                    </h3>
                    <ul className="space-y-3 mt-4">
                        <li className="text-xs text-gray-600 dark:text-wolf flex gap-2 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-persian mt-1.5 shrink-0"></span>
                            <span>Nuevo motor de limpieza inteligente con detección de anomalías.</span>
                        </li>
                        <li className="text-xs text-gray-600 dark:text-wolf flex gap-2 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-persian mt-1.5 shrink-0"></span>
                            <span>Exportación directa a scripts de Python (Tkinter).</span>
                        </li>
                        <li className="text-xs text-gray-600 dark:text-wolf flex gap-2 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-persian mt-1.5 shrink-0"></span>
                            <span>Interfaz "Zen Mode" optimizada para pantallas pequeñas.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

// Componente auxiliar para los links rápidos
const QuickLink = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 hover:border-persian/50 hover:shadow-sm transition-all text-sm text-gray-700 dark:text-zinc group text-left">
        <div className="text-gray-400 group-hover:text-persian transition-colors">{icon}</div>
        <span className="flex-1">{label}</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-persian"/>
    </button>
);