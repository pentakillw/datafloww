import React, { useState } from 'react';
import { 
  Terminal, Download, Play, CheckCircle2, 
  Monitor, Box, ChevronRight, Copy, Check 
} from 'lucide-react';

export default function InstallGuide() {
  const [copied, setCopied] = useState(false);
  const installCmd = "pip install pandas openpyxl numpy";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-y-auto custom-scrollbar h-full">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc mb-2 flex items-center gap-3">
             <Monitor className="text-persian" size={32} /> Guía de Ejecución
           </h1>
           <p className="text-gray-500 dark:text-wolf text-lg max-w-3xl">
             Para ejecutar los scripts generados por <strong>NoCodePY</strong> en tu computadora, necesitas preparar tu entorno una única vez. Sigue estos 3 pasos.
           </p>
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-12">

          {/* PASO 1: PYTHON */}
          <section className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
               <div className="text-persian font-black text-6xl opacity-20 mb-2">01</div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Instalar Python</h2>
               <p className="text-gray-500 dark:text-wolf text-sm leading-relaxed">
                 Es el motor que hace funcionar el código. Sin él, tu computadora no entenderá el archivo .py.
               </p>
               <a href="https://www.python.org/downloads/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20">
                 <Download size={16}/> Descargar Python
               </a>
            </div>
            <div className="md:w-2/3 bg-gray-100 dark:bg-black/30 rounded-xl p-6 border border-gray-200 dark:border-wolf/10 relative overflow-hidden group">
               <div className="absolute top-4 right-4 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20 animate-pulse">
                 ⚠️ MUY IMPORTANTE
               </div>
               <h3 className="font-bold text-gray-800 dark:text-zinc mb-4">Durante la instalación:</h3>
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      En la primera pantalla del instalador, debes marcar la casilla que dice: <br/>
                      <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-white/10 px-1 rounded">Add Python to PATH</span>
                    </p>
                 </div>
                 <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Luego haz clic en "Install Now" y espera a que termine.
                    </p>
                 </div>
               </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-wolf/10" />

          {/* PASO 2: VS CODE */}
          <section className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
               <div className="text-persian font-black text-6xl opacity-20 mb-2">02</div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Visual Studio Code</h2>
               <p className="text-gray-500 dark:text-wolf text-sm leading-relaxed">
                 El editor de código estándar mundial. Aquí abrirás y ejecutarás tu script.
               </p>
               <a href="https://code.visualstudio.com/download" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20">
                 <Download size={16}/> Descargar VS Code
               </a>
            </div>
            <div className="md:w-2/3 bg-gray-100 dark:bg-black/30 rounded-xl p-6 border border-gray-200 dark:border-wolf/10">
               <h3 className="font-bold text-gray-800 dark:text-zinc mb-4">Configuración rápida:</h3>
               <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                 <li>Instala y abre VS Code.</li>
                 <li>Ve al icono de extensiones (cuadritos a la izquierda).</li>
                 <li>Busca <strong>"Python"</strong> (creada por Microsoft) e instálala.</li>
                 <li>Esto habilitará el botón de "Play" <Play size={12} className="inline"/> para ejecutar tu código.</li>
               </ol>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-wolf/10" />

          {/* PASO 3: LIBRERÍAS */}
          <section className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
               <div className="text-persian font-black text-6xl opacity-20 mb-2">03</div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Instalar Librerías</h2>
               <p className="text-gray-500 dark:text-wolf text-sm leading-relaxed">
                 Tu script necesita herramientas especiales (Pandas, OpenPyXL) para leer Excel. Instálalas con un comando.
               </p>
            </div>
            <div className="md:w-2/3">
               <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
                 <div className="bg-[#252526] px-4 py-2 flex justify-between items-center border-b border-black/50">
                    <span className="text-xs font-mono text-gray-400">Terminal (CMD o PowerShell)</span>
                    <button onClick={copyToClipboard} className="text-xs flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copiado' : 'Copiar'}
                    </button>
                 </div>
                 <div className="p-6 font-mono text-sm text-green-400">
                    <span className="text-gray-500 select-none">C:\Users\Tú </span>
                    {installCmd}
                 </div>
               </div>
               <p className="mt-3 text-xs text-gray-500 dark:text-wolf flex items-center gap-2">
                 <Box size={14} /> Solo necesitas ejecutar esto una vez en tu terminal.
               </p>
            </div>
          </section>

          {/* PASO FINAL: EJECUTAR */}
          <div className="bg-persian/10 rounded-2xl p-8 border border-persian/20 flex flex-col md:flex-row items-center gap-6 mt-8">
             <div className="p-4 bg-white dark:bg-carbon rounded-full shadow-lg text-persian">
               <Play size={40} fill="currentColor" />
             </div>
             <div className="flex-1">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Todo listo!</h3>
               <p className="text-gray-600 dark:text-zinc text-sm">
                 1. Descarga tu script desde <strong>Export Hub</strong>.<br/>
                 2. Abre el archivo <code>.py</code> con VS Code.<br/>
                 3. Presiona el botón de <strong>Play (▷)</strong> en la esquina superior derecha.<br/>
                 4. ¡Tu aplicación automática se abrirá en una ventana nueva!
               </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}