import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileJson, Copy, Check, FileSpreadsheet, Terminal, Package, Database, ShieldAlert, Lock, Crown 
} from 'lucide-react';
import { generateSQL, generatePythonGUI, generateMCode, generateRCode } from '../utils/exportGenerators';

// COMPONENTE DE BLOQUEO PRO
const ProLockOverlay = () => (
    <div className="absolute inset-0 bg-white/80 dark:bg-[#1e1e1e]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 border border-gray-200 dark:border-wolf/10 rounded-xl">
        <div className="bg-persian/10 p-4 rounded-full mb-4 ring-1 ring-persian/30">
            <Lock size={40} className="text-persian"/>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            Función PRO <Crown size={20} className="text-yellow-500 fill-yellow-500"/>
        </h3>
        <p className="text-gray-500 dark:text-wolf mb-6 max-w-sm">
            La generación automática de código Python y SQL está reservada para usuarios PRO. Automatiza tus tareas hoy mismo.
        </p>
        <button className="bg-persian hover:bg-sea text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-persian/20 transition-all hover:-translate-y-1">
            Actualizar a PRO
        </button>
    </div>
);

export default function ExportHub() {
  const { data, columns, actions, fileName, planLimits, userTier, cloudFiles, currentFileId, projects } = useData();
  const [activeTab, setActiveTab] = useState('files');
  const [copied, setCopied] = useState(false);

  // Detección de sugerencias de automatización
  const suggestion = actions.find(a => a.type === 'SUGGEST_EXPORT');
  
  // Auto-activar tab si hay sugerencia (solo la primera vez)
  React.useEffect(() => {
      if (suggestion && activeTab === 'files') {
          if (suggestion.format === 'SQL') setActiveTab('sql');
          if (suggestion.format === 'JSON') setActiveTab('files'); // JSON está en files
      }
  }, [suggestion]);

  // --- PREPARAR PIPELINES PARA PYTHON ---
  const preparePythonPipelines = () => {
      // 1. Verificar si el archivo actual pertenece a un proyecto
      const currentFileMeta = cloudFiles.find(f => f.filename === fileName); // O usar currentFileId si es consistente
      const projectId = currentFileMeta?.projectId;

      if (projectId) {
          // MODO PROYECTO: Recopilar todos los archivos del proyecto
          const projectFiles = cloudFiles.filter(f => f.projectId === projectId);
          const projectName = projects.find(p => p.id === projectId)?.name || "Proyecto";
          
          const pipelines = {};
          projectFiles.forEach(f => {
              if (f.actions && f.actions.length > 0) {
                  pipelines[f.filename] = {
                      pattern: f.filename, // Simplificación: Usar nombre exacto o patrón regex si se desea
                      actions: f.actions,
                      description: `Transformaciones para ${f.filename}`
                  };
              }
          });
          
          // Si no hay pipelines (archivos sin acciones), añadir al menos el actual si tiene
          if (Object.keys(pipelines).length === 0 && actions.length > 0) {
               pipelines[fileName] = { pattern: fileName, actions: actions, description: 'Transformación Actual' };
          }
          
          return pipelines;
      } else {
          // MODO SINGLE FILE
          return actions; // El generador lo convertirá a formato single
      }
  };

  const pythonCode = React.useMemo(() => generatePythonGUI(preparePythonPipelines()), [actions, cloudFiles, fileName]);

  // --- 1. EXPORTACIÓN DE ARCHIVOS ---
  const downloadCSV = () => {
    if (!data.length) return;
    const headers = columns.join(',');
    const rows = data.map(row => columns.map(col => {
      const cell = row[col] === null || row[col] === undefined ? '' : row[col].toString();
      return `"${cell.replace(/"/g, '""')}"`;
    }).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', `${fileName || 'export'}_processed.csv`);
    link.click();
  };

  const downloadJSON = () => {
    if (!data.length) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.setAttribute('download', `${fileName || 'export'}_processed.json`);
    link.click();
  };

  // --- 2. GENERADOR SQL OPTIMIZADO ---
  // (generateSQL importado de utils)

  // --- 3. GENERADOR PYTHON (TKINTER + PANDAS) - COMPLETO ---
  // (generatePythonGUI importado de utils)

  // --- 4. GENERADOR POWER QUERY (M) ---
  // (generateMCode importado de utils)

  // --- 5. GENERADOR R SCRIPT ---
  // (generateRCode importado de utils)

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };


  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
        
        <div className="p-6 border-b border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light">
           <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc mb-2 flex items-center gap-2"><Package className="text-persian" /> Export Hub</h2>
                <p className="text-gray-500 dark:text-wolf text-sm">Descarga tus datos procesados o genera código de automatización.</p>
             </div>
             {userTier === 'free' && <span className="text-xs bg-gray-200 px-3 py-1 rounded text-gray-600 font-bold">Plan Free</span>}
             {userTier === 'pro' && <span className="text-xs bg-persian/10 text-persian border border-persian/20 px-3 py-1 rounded font-bold flex gap-1 items-center"><Crown size={12}/> Plan Pro</span>}
           </div>
           
           <div className="flex gap-8 mt-8 border-b border-gray-200 dark:border-wolf/10 text-sm">
              <button onClick={() => setActiveTab('files')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'files' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <FileSpreadsheet size={16}/> 1. Archivos
              </button>
              <button onClick={() => setActiveTab('sql')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'sql' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <Database size={16}/> 2. SQL {userTier === 'free' && <Lock size={12} className="text-gray-400"/>}
              </button>
              <button onClick={() => setActiveTab('code')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'code' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <Terminal size={16}/> 3. Python {userTier === 'free' && <Lock size={12} className="text-gray-400"/>}
              </button>
              <button onClick={() => setActiveTab('m')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'm' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <FileJson size={16}/> 4. Power Query (M) {userTier === 'free' && <Lock size={12} className="text-gray-400"/>}
              </button>
              <button onClick={() => setActiveTab('r')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'r' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <Terminal size={16}/> 5. R Script {userTier === 'free' && <Lock size={12} className="text-gray-400"/>}
              </button>
           </div>
        </div>

        <div className="flex-1 p-6 bg-gray-50 dark:bg-black/20 overflow-auto custom-scrollbar relative">
          {!data.length ? (
             <div className="h-full flex flex-col items-center justify-center opacity-50">
               <Package size={48} className="mb-4 text-gray-400"/>
               <p>Carga datos primero.</p>
             </div>
          ) : (
            <>
              {activeTab === 'files' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full max-w-5xl mx-auto items-start pt-8 animate-in slide-in-from-bottom-4">
                  <div onClick={downloadCSV} className="cursor-pointer group bg-white dark:bg-carbon border-2 border-dashed border-gray-200 dark:border-wolf/20 hover:border-green-500 dark:hover:border-green-500 rounded-2xl p-10 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="p-5 bg-green-50 dark:bg-green-900/10 rounded-full mb-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform shadow-sm"><FileSpreadsheet size={48} /></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">CSV / Excel</h3>
                    <p className="text-sm text-gray-500 dark:text-wolf">Formato universal compatible.</p>
                    <span className="mt-6 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">Recomendado</span>
                  </div>
                  <div onClick={downloadJSON} className="cursor-pointer group bg-white dark:bg-carbon border-2 border-dashed border-gray-200 dark:border-wolf/20 hover:border-yellow-500 dark:hover:border-yellow-500 rounded-2xl p-10 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-full mb-6 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform shadow-sm"><FileJson size={48} /></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">JSON (API)</h3>
                    <p className="text-sm text-gray-500 dark:text-wolf">Estructura ligera.</p>
                  </div>
                </div>
              )}

              {activeTab === 'sql' && (
                <div className="h-full flex flex-col gap-4 relative animate-in fade-in">
                  {/* FEATURE UNLOCKED FOR ALL */}
                  <div className="flex justify-between items-center mb-2 px-1">
                      <div className="text-xs font-mono text-gray-500 dark:text-wolf flex items-center gap-2">
                        <Database size={12}/> script.sql
                        {userTier === 'free' && <span className="text-[10px] bg-persian/10 text-persian px-1.5 rounded font-bold border border-persian/20">Pro Unlocked</span>}
                      </div>
                      <button onClick={() => copyToClipboard(generateSQL(data, columns, fileName))} className="flex items-center gap-2 text-xs font-bold bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-persian/20 active:scale-95">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar SQL'}</button>
                  </div>
                  <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-700 custom-scrollbar shadow-inner text-left relative group">
                    <pre className="text-sm font-mono text-zinc whitespace-pre-wrap leading-relaxed"><code className="language-sql">{generateSQL(data, columns, fileName)}</code></pre>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="h-full flex flex-col gap-4 relative animate-in fade-in">
                  <div className="flex justify-between items-center mb-2 px-1">
                      <div className="text-xs font-mono text-gray-500 dark:text-wolf flex items-center gap-2">
                        <Terminal size={12}/> app.py (Tkinter + Pandas)
                        {userTier === 'free' && <span className="text-[10px] bg-persian/10 text-persian px-1.5 rounded font-bold border border-persian/20">Pro Unlocked</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1"><ShieldAlert size={10}/> Uso personal</span>
                        <button onClick={() => copyToClipboard(pythonCode)} className="flex items-center gap-2 text-xs font-bold bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-persian/20 active:scale-95">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar Código'}</button>
                      </div>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-200 dark:border-gray-700 custom-scrollbar shadow-inner text-left relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-zinc">{pythonCode}</pre>
                  </div>
                </div>
              )}

              {activeTab === 'm' && (
                <div className="h-full flex flex-col gap-4 relative animate-in fade-in">
                  <div className="flex justify-between items-center mb-2 px-1">
                      <div className="text-xs font-mono text-gray-500 dark:text-wolf flex items-center gap-2">
                        <FileJson size={12}/> Power Query (M)
                        {userTier === 'free' && <span className="text-[10px] bg-persian/10 text-persian px-1.5 rounded font-bold border border-persian/20">Pro Unlocked</span>}
                      </div>
                      <button onClick={() => copyToClipboard(generateMCode(fileName, columns, actions))} className="flex items-center gap-2 text-xs font-bold bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-persian/20 active:scale-95">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar M'}</button>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-200 dark:border-gray-700 custom-scrollbar shadow-inner text-left relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-zinc">{generateMCode(fileName, columns, actions)}</pre>
                  </div>
                </div>
              )}

              {activeTab === 'r' && (
                <div className="h-full flex flex-col gap-4 relative animate-in fade-in">
                  <div className="flex justify-between items-center mb-2 px-1">
                      <div className="text-xs font-mono text-gray-500 dark:text-wolf flex items-center gap-2">
                        <Terminal size={12}/> R Script (dplyr)
                        {userTier === 'free' && <span className="text-[10px] bg-persian/10 text-persian px-1.5 rounded font-bold border border-persian/20">Pro Unlocked</span>}
                      </div>
                      <button onClick={() => copyToClipboard(generateRCode(fileName, actions))} className="flex items-center gap-2 text-xs font-bold bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-persian/20 active:scale-95">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar R'}</button>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-200 dark:border-gray-700 custom-scrollbar shadow-inner text-left relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-zinc">{generateRCode(fileName, actions)}</pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}