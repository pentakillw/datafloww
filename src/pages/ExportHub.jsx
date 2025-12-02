import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileJson, Copy, Check, FileSpreadsheet, Terminal, Package, Database 
} from 'lucide-react';

export default function ExportHub() {
  const { data, columns, actions, fileName } = useData();
  const [activeTab, setActiveTab] = useState('files');
  const [copied, setCopied] = useState(false);

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
    link.setAttribute('download', 'data_export.csv');
    link.click();
  };

  const downloadJSON = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.setAttribute('download', 'data_export.json');
    link.click();
  };

  // --- 2. GENERADOR SQL ---
  const generateSQL = () => {
    if (!data.length) return "-- Sin datos para generar SQL";
    const tableName = fileName ? fileName.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_') : 'mi_tabla';
    
    let sql = `CREATE TABLE ${tableName} (\n`;
    sql += columns.map(col => `    ${col.replace(/[^a-zA-Z0-9_]/g, '_')} TEXT`).join(',\n');
    sql += `\n);\n\nINSERT INTO ${tableName} (${columns.map(c => c.replace(/[^a-zA-Z0-9_]/g, '_')).join(', ')}) VALUES\n`;
    
    const rows = data.slice(0, 500).map(row => { 
        const values = columns.map(col => {
            let val = row[col];
            if (val === null || val === undefined) return 'NULL';
            return `'${String(val).replace(/'/g, "''")}'`; 
        }).join(', ');
        return `(${values})`;
    }).join(',\n');
    
    return sql + rows + ';';
  };

  // --- 3. GENERADOR PYTHON REAL (PANDAS + TKINTER) ---
  const generatePythonGUI = () => {
    let transformationSteps = "";
    
    if (actions.length === 0) {
        transformationSteps += `            self.log("⚠ No hay transformaciones registradas. Se exportará el original.", "info")\n`;
    } else {
        // --- MAPEO DE ACCIONES DE REACT A CÓDIGO PANDAS ---
        actions.forEach((action, idx) => {
            const stepComment = `            # [PASO ${idx + 1}] ${action.description || action.type}`;
            transformationSteps += `${stepComment}\n`;
            
            switch (action.type) {
                // --- ESTRUCTURA ---
                case 'REORDER_COLS':
                    // Genera código para reordenar columnas
                    // Filtramos para asegurar que solo incluimos columnas que existen en el dataframe
                    const colList = action.newOrder.map(c => `'${c}'`).join(', ');
                    transformationSteps += `            desired_cols = [${colList}]\n`;
                    transformationSteps += `            existing_cols = [c for c in desired_cols if c in df.columns]\n`;
                    transformationSteps += `            df = df[existing_cols]\n`;
                    break;
                case 'DUPLICATE':
                    transformationSteps += `            if '${action.col}' in df.columns:\n`;
                    transformationSteps += `                # Buscar nombre único\n`;
                    transformationSteps += `                base_name = '${action.col}_Copy'\n`;
                    transformationSteps += `                i = 1\n`;
                    transformationSteps += `                new_name = base_name\n`;
                    transformationSteps += `                while new_name in df.columns:\n`;
                    transformationSteps += `                    new_name = f"{base_name}{i}"\n`;
                    transformationSteps += `                    i += 1\n`;
                    transformationSteps += `                df[new_name] = df['${action.col}']\n`;
                    break;
                case 'DROP_COLUMN': 
                    transformationSteps += `            if '${action.col}' in df.columns: df.drop(columns=['${action.col}'], inplace=True)\n`; 
                    break;
                case 'RENAME':
                    transformationSteps += `            df.rename(columns={'${action.col}': '${action.newVal}'}, inplace=True)\n`; 
                    break;
                case 'ADD_INDEX':
                    transformationSteps += `            df.insert(0, 'Index_ID', range(1, 1 + len(df)))\n`; 
                    break;
                case 'DROP_TOP_ROWS':
                    transformationSteps += `            df = df.iloc[${action.count}:].reset_index(drop=True)\n`; 
                    break;
                case 'PROMOTE_HEADER':
                    transformationSteps += `            df.columns = df.iloc[0]; df = df[1:].reset_index(drop=True)\n`; 
                    break;

                // --- LIMPIEZA ---
                case 'DROP_DUPLICATES': 
                    transformationSteps += `            df.drop_duplicates(inplace=True)\n`; 
                    break;
                case 'DROP_NULLS': 
                    transformationSteps += `            df.dropna(inplace=True)\n`; 
                    break;
                case 'FILL_NULLS': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'].fillna('${action.val}', inplace=True)\n`; 
                    break;
                case 'FILL_DOWN': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'].ffill(inplace=True)\n`; 
                    break;
                case 'SMART_CLEAN':
                    transformationSteps += `            df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)\n            df.dropna(how='all', inplace=True)\n            df.drop_duplicates(inplace=True)\n`; 
                    break;
                case 'CLEAN_SYMBOLS':
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.replace(r'[^a-zA-Z0-9\\s]', '', regex=True)\n`; 
                    break;
                case 'IMPUTE':
                    if (action.method === 'mean') transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'].fillna(pd.to_numeric(df['${action.col}'], errors='coerce').mean(), inplace=True)\n`;
                    if (action.method === 'median') transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'].fillna(pd.to_numeric(df['${action.col}'], errors='coerce').median(), inplace=True)\n`;
                    if (action.method === 'mode') transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'].fillna(df['${action.col}'].mode()[0], inplace=True)\n`;
                    break;

                // --- TEXTO ---
                case 'UPPERCASE': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.upper()\n`; 
                    break;
                case 'LOWERCASE': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.lower()\n`; 
                    break;
                case 'TITLE_CASE': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.title()\n`; 
                    break;
                case 'TRIM': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.strip()\n`; 
                    break;
                case 'REPLACE': 
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.replace('${action.find}', '${action.replace}', regex=False)\n`; 
                    break;
                case 'SUBSTRING':
                    transformationSteps += `            if '${action.col}' in df.columns: df['${action.col}_Sub'] = df['${action.col}'].astype(str).str[${action.start}:${parseInt(action.start)+parseInt(action.len)}]\n`; 
                    break;
                case 'MERGE_COLS':
                    transformationSteps += `            df['${action.col1}_${action.col2}'] = df['${action.col1}'].astype(str) + '${action.sep}' + df['${action.col2}'].astype(str)\n`; 
                    break;
                
                // --- LÓGICA Y FILTROS ---
                case 'FILTER':
                    if (action.op === 'contains') transformationSteps += `            df = df[df['${action.col}'].astype(str).str.contains('${action.val}', na=False, case=False)]\n`;
                    if (action.op === 'equals') transformationSteps += `            df = df[df['${action.col}'].astype(str) == '${action.val}']\n`;
                    if (action.op === 'greater') transformationSteps += `            df = df[pd.to_numeric(df['${action.col}'], errors='coerce') > ${action.val}]\n`;
                    break;
                case 'SORT_ASC':
                    transformationSteps += `            df.sort_values(by='${action.col}', ascending=True, inplace=True)\n`; 
                    break;
                case 'CONDITIONAL':
                    let op = action.op === '=' ? '==' : action.op;
                    transformationSteps += `            df['${action.target}'] = np.where(pd.to_numeric(df['${action.col}'], errors='coerce') ${op} ${action.val}, '${action.trueVal}', '${action.falseVal}')\n`;
                    break;

                // --- MATEMÁTICAS ---
                case 'CALC_MATH': 
                    transformationSteps += `            df['${action.target}'] = pd.to_numeric(df['${action.col1}'], errors='coerce') ${action.op} pd.to_numeric(df['${action.col2}'], errors='coerce')\n`; 
                    break;
                case 'ROUND':
                    transformationSteps += `            df['${action.col}'] = pd.to_numeric(df['${action.col}'], errors='coerce').round(${action.decimals})\n`; 
                    break;
                
                // --- DATA SCIENCE ---
                case 'Z-SCORE':
                    transformationSteps += `            if '${action.col}' in df.columns:\n                mean = df['${action.col}'].mean()\n                std = df['${action.col}'].std()\n                df['${action.col}_ZScore'] = (df['${action.col}'] - mean) / std\n`;
                    break;
                case 'MIN-MAX':
                    transformationSteps += `            if '${action.col}' in df.columns:\n                min_val = df['${action.col}'].min()\n                max_val = df['${action.col}'].max()\n                df['${action.col}_Norm'] = (df['${action.col}'] - min_val) / (max_val - min_val)\n`;
                    break;
                case 'ONE-HOT':
                    transformationSteps += `            if '${action.col}' in df.columns:\n                dummies = pd.get_dummies(df['${action.col}'], prefix='${action.col}')\n                df = pd.concat([df, dummies], axis=1)\n`;
                    break;

                default:
                    transformationSteps += `            # Acción ${action.type} (Lógica no mapeada en exportación)\n`;
            }
            transformationSteps += `            self.log(f"✅ [OK] ${action.type}")\n`;
        });
    }

    return `"""
# -----------------------------------------------------------------------------
# GENERATED BY DATAFLOW PRO - LICENSED SOFTWARE
# -----------------------------------------------------------------------------
# AVISO LEGAL Y TÉRMINOS DE USO:
# 
# 1. Este código fuente es generado automáticamente por DataFlow Pro.
# 2. LICENCIA PERSONAL: Se otorga al usuario registrado una licencia de uso
#    estrictamente personal e interna.
# 3. PROHIBICIÓN DE VENTA: Queda terminantemente PROHIBIDA la venta, reventa,
#    sublicenciamiento, alquiler o distribución comercial de este script o
#    de los ejecutables derivados del mismo.
# 4. PROPIEDAD INTELECTUAL: El motor lógico y la estructura de este código
#    permanecen como propiedad intelectual de DataFlow Pro.
# 
# Violaciones a estos términos resultarán en la cancelación de la cuenta y
# posibles acciones legales por infracción de derechos de autor.
# -----------------------------------------------------------------------------
"""
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import pandas as pd
import numpy as np
import os
import threading
import time
import base64
import json

# --- CONFIGURACIÓN VISUAL ---
COLOR_BG = "#1e1e1e"
COLOR_PANEL = "#252526"
COLOR_ACCENT = "#029CA3"
COLOR_TEXT = "#FDFDFD"
FONT_MAIN = ("Segoe UI", 10)
FONT_HEADER = ("Segoe UI", 14, "bold")
FONT_MONO = ("Consolas", 9)

class DataFlowApp:
    def __init__(self, root):
        self.root = root
        self.root.title("DataFlow Pro | Automation Runtime")
        self.root.geometry("700x600")
        self.root.configure(bg=COLOR_BG)
        self.file_path = None

        header = tk.Frame(root, bg=COLOR_PANEL, height=70); header.pack(fill="x")
        tk.Label(header, text="⚡ DataFlow Pro", font=FONT_HEADER, bg=COLOR_PANEL, fg=COLOR_ACCENT).place(x=20, y=20)
        tk.Label(header, text="Runtime v2.0", font=("Segoe UI", 8), bg=COLOR_PANEL, fg="#666").place(x=630, y=25)
        
        main = tk.Frame(root, bg=COLOR_BG, padx=25, pady=25); main.pack(fill="both", expand=True)

        tk.Label(main, text="ARCHIVO ORIGEN (.csv / .xlsx)", font=("Segoe UI", 9, "bold"), bg=COLOR_BG, fg="#888").pack(anchor="w")
        frm_in = tk.Frame(main, bg=COLOR_BG, pady=5); frm_in.pack(fill="x")
        self.entry_path = tk.Entry(frm_in, bg="#333", fg="white", font=FONT_MAIN, relief="flat", insertbackground="white")
        self.entry_path.pack(side="left", fill="x", expand=True, ipady=6, padx=(0, 10))
        tk.Button(frm_in, text="📂 Examinar", command=self.select_file, bg="#444", fg="white", relief="flat", padx=15, cursor="hand2").pack(side="right")

        tk.Label(main, text="REGISTRO DE EJECUCIÓN", font=("Segoe UI", 9, "bold"), bg=COLOR_BG, fg="#888").pack(anchor="w", pady=(25, 5))
        self.log_area = scrolledtext.ScrolledText(main, height=15, bg="#111", fg="#0f0", font=FONT_MONO, relief="flat", state="disabled", bd=0)
        self.log_area.pack(fill="both", expand=True)
        self.log_area.tag_config("err", foreground="#ff5555")
        self.log_area.tag_config("info", foreground="#88ccff")

        self.btn_run = tk.Button(main, text="▶ EJECUTAR TRANSFORMACIÓN", command=self.start_thread, bg=COLOR_ACCENT, fg="white", font=("Segoe UI", 11, "bold"), relief="flat", cursor="hand2", pady=12, state="disabled")
        self.btn_run.pack(fill="x", pady=20)

        tk.Label(root, text="Generated by DataFlow Pro", bg=COLOR_BG, fg="#444", font=("Segoe UI", 8)).pack(side="bottom", pady=5)

    def log(self, msg, tag=None):
        self.log_area.config(state="normal"); self.log_area.insert(tk.END, msg + "\\n", tag); self.log_area.see(tk.END); self.log_area.config(state="disabled")

    def select_file(self):
        fn = filedialog.askopenfilename(filetypes=[("Data Files", "*.csv *.xlsx")])
        if fn:
            self.file_path = fn
            self.entry_path.delete(0, tk.END); self.entry_path.insert(0, fn)
            self.btn_run.config(state="normal", bg=COLOR_ACCENT)
            self.log(f"[INFO] Archivo seleccionado: {os.path.basename(fn)}", "info")

    def start_thread(self): threading.Thread(target=self.run_process).start()

    def run_process(self):
        inp = self.entry_path.get()
        if not inp: return
        self.btn_run.config(state="disabled", text="PROCESANDO...", bg="#444")
        self.log("-" * 60); self.log(f"[INICIO] Motor ETL iniciado")
        try:
            if inp.endswith('.csv'): df = pd.read_csv(inp, header='infer')
            else: df = pd.read_excel(inp, header='infer')
            self.log(f"[CARGA] {len(df)} filas cargadas.", "info")

${transformationSteps}
            
            out = os.path.splitext(inp)[0] + "_processed.csv"
            df.to_csv(out, index=False)
            self.log("-" * 60); self.log(f"🚀 [EXITO] Guardado: {os.path.basename(out)}", "info")
            messagebox.showinfo("Proceso Completado", f"Exito.\\nArchivo: {os.path.basename(out)}")
        except Exception as e:
            self.log(f"❌ [ERROR FATAL]: {str(e)}", "err")
            messagebox.showerror("Error", str(e))
        finally:
            self.btn_run.config(state="normal", text="▶ EJECUTAR TRANSFORMACIÓN", bg=COLOR_ACCENT)

if __name__ == "__main__":
    root = tk.Tk(); app = DataFlowApp(root); root.mainloop()
`;
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc mb-2 flex items-center gap-2"><Package className="text-persian" /> Centro de Exportación</h2>
           <p className="text-gray-500 dark:text-wolf text-sm">Descarga tus datos procesados o genera código de automatización.</p>
           
           {/* Tabs */}
           <div className="flex gap-6 mt-6 border-b border-transparent text-sm">
              <button onClick={() => setActiveTab('files')} className={`pb-2 px-1 font-medium transition-colors border-b-2 ${activeTab === 'files' ? 'text-persian border-persian' : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-wolf dark:hover:text-white'}`}>1. Archivos</button>
              <button onClick={() => setActiveTab('sql')} className={`pb-2 px-1 font-medium transition-colors border-b-2 ${activeTab === 'sql' ? 'text-persian border-persian' : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-wolf dark:hover:text-white'}`}>2. SQL Generator</button>
              <button onClick={() => setActiveTab('code')} className={`pb-2 px-1 font-medium transition-colors border-b-2 ${activeTab === 'code' ? 'text-persian border-persian' : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-wolf dark:hover:text-white'}`}>3. Python App</button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-black/20 overflow-auto">
          {!data.length ? (
             <div className="h-full flex flex-col items-center justify-center opacity-50">
               <Package size={48} className="mb-4 text-gray-400"/>
               <p>Carga datos primero en la sección "Datos".</p>
             </div>
          ) : (
            <>
              {activeTab === 'files' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-w-4xl mx-auto items-start pt-10">
                  <div onClick={downloadCSV} className="cursor-pointer group bg-white dark:bg-carbon border-2 border-dashed border-gray-200 dark:border-wolf/20 hover:border-green-500 dark:hover:border-green-500 rounded-xl p-8 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"><FileSpreadsheet size={40} /></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-zinc">CSV / Excel</h3>
                    <p className="text-sm text-gray-500 mt-2">Formato estándar compatible con todo.</p>
                  </div>
                  <div onClick={downloadJSON} className="cursor-pointer group bg-white dark:bg-carbon border-2 border-dashed border-gray-200 dark:border-wolf/20 hover:border-yellow-500 dark:hover:border-yellow-500 rounded-xl p-8 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform"><FileJson size={40} /></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-zinc">JSON (API)</h3>
                    <p className="text-sm text-gray-500 mt-2">Estructura ligera para desarrolladores.</p>
                  </div>
                </div>
              )}

              {activeTab === 'sql' && (
                <div className="h-full flex flex-col gap-4 relative">
                  <div className="absolute top-4 right-6 z-10">
                    <button onClick={() => copyToClipboard(generateSQL())} className="flex items-center gap-2 text-xs bg-persian hover:bg-sea text-white px-3 py-1.5 rounded-md transition-colors shadow-lg">
                        {copied ? <Check size={14} /> : <Copy size={14} />} Copiar
                    </button>
                  </div>
                  <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-700 custom-scrollbar shadow-inner text-left relative">
                    <div className="text-xs text-gray-500 mb-4 font-mono"> &gt; SCRIPT.SQL</div>
                    <pre className="text-sm font-mono text-zinc whitespace-pre-wrap"><code className="language-sql">{generateSQL()}</code></pre>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="h-full flex flex-col gap-4 relative">
                  {/* Botón Copiar Flotante */}
                  <div className="absolute top-4 right-6 z-10">
                    <button onClick={() => copyToClipboard(generatePythonGUI())} className="flex items-center gap-2 text-xs bg-persian hover:bg-sea text-white px-3 py-1.5 rounded-md transition-colors shadow-lg">
                        {copied ? <Check size={14} /> : <Copy size={14} />} Copiar
                    </button>
                  </div>
                  
                  {/* Editor de código - USO 'text-zinc' PARA ASEGURAR VISIBILIDAD */}
                  <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-700 custom-scrollbar shadow-inner text-left">
                    <div className="text-xs text-gray-500 mb-4 font-mono"> &gt; APP.PY</div>
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-zinc">
                        {generatePythonGUI()}
                    </pre>
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