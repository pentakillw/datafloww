import React, { useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
  UploadCloud, Database, Sparkles, Zap, BookOpen, 
  MonitorPlay, ArrowRight, FileSpreadsheet, Server,
  Activity, CheckCircle2, ChevronRight, Crown, AlertTriangle,
  FileText, Folder, Clock, BarChart3, PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/i18n.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  // Usamos redirectToBilling
  const { data, columns, actions, userTier, planLimits, filesUploadedCount, cloudFiles, projects } = useData();
  const totalRows = data.length;
  const { t } = useI18n();
  const adRef = useRef(null);

  // Calculamos porcentaje de uso del plan
  const filesUsed = filesUploadedCount;
  const filesMax = planLimits.maxFiles;
  const usagePercent = Math.min(100, (filesUsed / filesMax) * 100);

  // --- CALCULOS DE INSIGHTS ---
  const insights = useMemo(() => {
    if (data.length === 0) {
      // Si no hay datos cargados, mostramos estadísticas globales
      const recentFiles = cloudFiles.slice(0, 3);
      const activeProjects = projects.length;
      return { type: 'global', recentFiles, activeProjects };
    } else {
      // Si hay datos, mostramos análisis de calidad
      let emptyCells = 0;
      let totalCells = data.length * columns.length;
      
      // Muestreo para rendimiento si es muy grande
      const sampleSize = Math.min(data.length, 1000);
      const sampleData = data.slice(0, sampleSize);
      
      sampleData.forEach(row => {
        columns.forEach(col => {
           const val = row[col];
           if (val === null || val === undefined || val === '') emptyCells++;
        });
      });

      // Extrapolar si usamos muestra
      if (data.length > sampleSize) {
         emptyCells = Math.floor((emptyCells / (sampleSize * columns.length)) * totalCells);
      }

      const qualityScore = Math.max(0, 100 - Math.round((emptyCells / totalCells) * 100));
      
      return { 
        type: 'dataset', 
        qualityScore, 
        emptyCells, 
        totalCells,
        colCount: columns.length 
      };
    }
  }, [data, columns, cloudFiles, projects]);

  useEffect(() => {
    const container = adRef.current;
    if (!container) return;
    container.innerHTML = '';
    const opt = document.createElement('script');
    opt.type = 'text/javascript';
    opt.text = `
      atOptions = {
        'key' : '3452c72ad45c5ef8a14dc39c54932a89',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/3452c72ad45c5ef8a14dc39c54932a89/invoke.js';
    script.async = true;
    container.appendChild(opt);
    container.appendChild(script);
    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return (
    <div className="h-full flex flex-col p-2 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
        
        {/* HERO BANNER - Compacto */}
        <div className="relative bg-gradient-to-r from-persian via-sea to-purple-500 p-4 rounded-t-xl overflow-hidden flex-shrink-0">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-white pointer-events-none">
             <Sparkles size={120} />
           </div>
           
           <div className="relative z-10 flex flex-row justify-between items-center gap-4">
             <div>
               <div className="flex items-center gap-2 mb-0.5">
                 <h1 className="text-xl font-black text-white tracking-tight">{t('dashboard.hero.greeting')}</h1>
                 {userTier === 'pro' && <span className="bg-yellow-400/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><Crown size={8} fill="currentColor"/> {t('dashboard.hero.proBadge')}</span>}
                 {userTier === 'free' && <span className="bg-gray-200/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/20">{t('dashboard.hero.freeBadge')}</span>}
               </div>
               <p className="text-teal-50 text-xs max-w-lg leading-snug opacity-90">
                 {userTier === 'free' 
                    ? t('dashboard.hero.freeHint') 
                    : t('dashboard.hero.proHint')}
               </p>
             </div>

             {/* Tarjeta de Estado de Cuenta (Límites) - Compacta */}
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 w-40 text-white flex-shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold uppercase opacity-80">{t('dashboard.limits.filesLabel')}</span>
                  <span className="text-[9px] font-mono">{filesUsed} / {filesMax}</span>
                </div>
                <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-400' : 'bg-green-400'}`} 
                     style={{ width: `${usagePercent}%` }}
                   ></div>
                </div>
             </div>
           </div>
        </div>

        {/* INSIGHTS & STATS SECTION (Nuevo) */}
        <div className="bg-gray-50 dark:bg-carbon-light px-4 py-3 border-b border-gray-200 dark:border-wolf/20 flex-shrink-0">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Stat 1: Datos Activos */}
                <div className="bg-white dark:bg-carbon p-2 rounded-lg border border-gray-100 dark:border-wolf/10 shadow-sm flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md">
                        <Database size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">{t('dashboard.stats.records')}</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{totalRows.toLocaleString()}</p>
                    </div>
                </div>

                {/* Stat 2: Dinámico (Calidad o Proyectos) */}
                {insights.type === 'dataset' ? (
                     <div className="bg-white dark:bg-carbon p-2 rounded-lg border border-gray-100 dark:border-wolf/10 shadow-sm flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${insights.qualityScore > 80 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            <Activity size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">{t('dashboard.stats.dataQuality')}</p>
                            <div className="flex items-center gap-1">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{insights.qualityScore}%</p>
                                <span className="text-[9px] text-gray-400">({insights.emptyCells} {t('dashboard.stats.emptyCells')})</span>
                            </div>
                        </div>
                     </div>
                ) : (
                    <div className="bg-white dark:bg-carbon p-2 rounded-lg border border-gray-100 dark:border-wolf/10 shadow-sm flex items-center gap-3">
                        <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-md">
                            <Folder size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">{t('dashboard.stats.projects')}</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{insights.activeProjects}</p>
                        </div>
                    </div>
                )}

                {/* Stat 3: Recientes o Columnas */}
                {insights.type === 'dataset' ? (
                     <div className="bg-white dark:bg-carbon p-2 rounded-lg border border-gray-100 dark:border-wolf/10 shadow-sm flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-md">
                            <BarChart3 size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">{t('dashboard.stats.dimensions')}</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{insights.colCount} {t('dashboard.stats.colsShort')}</p>
                        </div>
                     </div>
                ) : (
                    <div className="bg-white dark:bg-carbon p-2 rounded-lg border border-gray-100 dark:border-wolf/10 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
                        <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-md">
                            <Clock size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-gray-400 uppercase font-bold">{t('dashboard.stats.lastFile')}</p>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                {insights.recentFiles[0]?.filename || t('dashboard.stats.none')}
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Stat 4: Acciones */}
                 <div className="bg-white dark:bg-carbon p-2 rounded-lg border border-gray-100 dark:border-wolf/10 shadow-sm flex items-center gap-3 md:col-span-1 hidden md:flex">
                    <div className={`p-1.5 rounded-md ${actions.length > 0 ? 'bg-persian/10 text-persian' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                        <Zap size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">{t('dashboard.stats.transforms')}</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{actions.length}</p>
                    </div>
                </div>

            </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* SECCIÓN 2: GUÍAS CRÍTICAS - Grid ajustado */}
            <h2 className="text-xs font-bold text-gray-900 dark:text-zinc mb-3 flex items-center gap-1.5 uppercase tracking-wider opacity-70">
               <Server size={14} className="text-persian"/> {t('dashboard.sections.preparation')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div 
                  onClick={() => navigate('/guide')}
                  className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/30 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 h-24 flex flex-col justify-between"
                >
                   <div className="absolute -top-4 -right-4 p-4 opacity-10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"><MonitorPlay size={80} /></div>
                   <div className="relative z-10 flex items-start gap-3">
                      <div className="p-2 bg-blue-500 text-white rounded-lg shadow-md shadow-blue-500/20 flex-shrink-0"><MonitorPlay size={16} /></div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{t('dashboard.prep.guide.title')}</h3>
                        <p className="text-gray-600 dark:text-blue-100 text-[10px] leading-snug line-clamp-1">{t('dashboard.prep.guide.desc')}</p>
                      </div>
                   </div>
                   <div className="relative z-10 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 group-hover:underline mt-1">{t('dashboard.prep.guide.cta')} <ArrowRight size={12} /></div>
                </div>

                <div 
                  onClick={() => navigate('/docs')}
                  className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 p-4 rounded-xl border border-purple-200 dark:border-purple-900/30 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 h-24 flex flex-col justify-between"
                >
                   <div className="absolute -top-4 -right-4 p-4 opacity-10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><BookOpen size={80} /></div>
                   <div className="relative z-10 flex items-start gap-3">
                      <div className="p-2 bg-purple-500 text-white rounded-lg shadow-md shadow-purple-500/20 flex-shrink-0"><BookOpen size={16} /></div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{t('dashboard.prep.docs.title')}</h3>
                        <p className="text-gray-600 dark:text-purple-100 text-[10px] leading-snug line-clamp-1">{t('dashboard.prep.docs.desc')}</p>
                      </div>
                   </div>
                   <div className="relative z-10 flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-300 group-hover:underline mt-1">{t('dashboard.prep.docs.cta')} <ArrowRight size={12} /></div>
                </div>
            </div>

            {/* SECCIÓN 3: FLUJO - Grid ajustado */}
            <h2 className="text-xs font-bold text-gray-900 dark:text-zinc mb-3 flex items-center gap-1.5 uppercase tracking-wider opacity-70">
               <Zap size={14} className="text-persian"/> {t('dashboard.sections.workflow')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ActionCard icon={<UploadCloud size={20} />} title={t('dashboard.actions.uploadTitle')} desc={t('dashboard.actions.uploadDesc')} onClick={() => navigate('/data')} color="persian" active={data.length === 0} />
                <ActionCard icon={<Sparkles size={20} />} title={t('dashboard.actions.transformTitle')} desc={t('dashboard.actions.transformDesc')} onClick={() => navigate('/transform')} color="sea" active={data.length > 0 && actions.length === 0} disabled={data.length === 0} />
                <ActionCard icon={<FileSpreadsheet size={20} />} title={t('dashboard.actions.exportTitle')} desc={t('dashboard.actions.exportDesc')} onClick={() => navigate('/export')} color="purple-500" active={actions.length > 0} disabled={data.length === 0} />
            </div>

            <div className="w-full flex justify-end mt-6">
              <div className="rounded-xl border border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light p-2 shadow-sm">
                <div ref={adRef} style={{ width: 300, height: 250 }} className="flex items-center justify-center" />
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, color, active, disabled }) {
  const { t } = useI18n();
  const colorClasses = {
    'persian': 'bg-persian text-white group-hover:shadow-persian/50',
    'sea': 'bg-sea text-white group-hover:shadow-sea/50',
    'purple-500': 'bg-purple-500 text-white group-hover:shadow-purple-500/50',
  };
  const textColors = { 'persian': 'text-persian', 'sea': 'text-sea', 'purple-500': 'text-purple-500' };

  return (
    <button onClick={onClick} disabled={disabled} className={`group text-left relative p-3 rounded-xl border transition-all h-24 flex flex-col justify-between ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-carbon border-gray-200 dark:border-wolf/10' : 'bg-white dark:bg-carbon-light border-gray-200 dark:border-wolf/20 hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}`}>
       {active && <div className="absolute top-2 right-2"><span className="relative flex h-2 w-2"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${color}`}></span><span className={`relative inline-flex rounded-full h-2 w-2 bg-${color}`}></span></span></div>}
       <div className="flex items-center gap-3">
           <div className={`p-1.5 rounded-lg shadow-sm transition-shadow ${disabled ? 'bg-gray-200 dark:bg-wolf/10 text-gray-400' : colorClasses[color]}`}>{icon}</div>
           <div>
               <h3 className="text-sm font-bold text-gray-900 dark:text-zinc">{title}</h3>
               <p className={`text-[10px] ${disabled ? 'text-gray-400 dark:text-wolf/60' : 'text-gray-500 dark:text-wolf'}`}>{desc}</p>
           </div>
       </div>
       <div className={`flex items-center gap-1 text-[10px] font-bold transition-colors self-end ${disabled ? 'text-gray-400' : `${textColors[color]} group-hover:underline`}`}>{disabled ? t('dashboard.actions.wait') : t('dashboard.actions.open')} <ChevronRight size={10} className={disabled ? '' : 'group-hover:translate-x-1 transition-transform'} /></div>
    </button>
  );
}
