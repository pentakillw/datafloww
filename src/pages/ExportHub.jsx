import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileJson, Copy, Check, FileSpreadsheet, Terminal, Package, Database, ShieldAlert 
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

  // --- 2. GENERADOR SQL ---
  const generateSQL = () => {
    if (!data.length) return "-- Sin datos para generar SQL";
    const tableName = fileName ? fileName.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_') : 'nocodepy_table';
    
    let sql = `-- --------------------------------------------------------\n`;
    sql += `-- EXPORTADO POR NOCODEPY\n`;
    sql += `-- Tabla: ${tableName}\n`;
    sql += `-- --------------------------------------------------------\n\n`;
    
    sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    sql += columns.map(col => `    "${col}" TEXT`).join(',\n');
    sql += `\n);\n\n`;
    
    sql += `INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')}) VALUES\n`;
    
    const rows = data.slice(0, 1000).map(row => { 
        const values = columns.map(col => {
            let val = row[col];
            if (val === null || val === undefined) return 'NULL';
            return `'${String(val).replace(/'/g, "''")}'`; 
        }).join(', ');
        return `(${values})`;
    }).join(',\n');
    
    return sql + rows + ';\n\n-- Nota: Se muestran las primeras 1000 filas por rendimiento.';
  };

  // --- 3. GENERADOR PYTHON REAL (PANDAS + TKINTER) ---
  const generatePythonGUI = () => {
    let steps = "";
    
    if (actions.length === 0) {
        steps += `            self.log("⚠ No hay transformaciones registradas. Se exportará el original.", "info")\n`;
    } else {
        actions.forEach((action, idx) => {
            steps += `            # [PASO ${idx + 1}] ${action.description}\n`;
            
            switch (action.type) {
                // --- ESTADO INICIAL ---
                case 'SMART_CLEAN':
                    steps += `            df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)\n`;
                    steps += `            df.dropna(how='all', inplace=True)\n`;
                    steps += `            df.drop_duplicates(inplace=True)\n`;
                    break;

                // --- ESTRUCTURA ---
                case 'REORDER_COLS':
                    steps += `            desired_cols = ${JSON.stringify(action.newOrder)}\n`;
                    steps += `            existing_cols = [c for c in desired_cols if c in df.columns]\n`;
                    steps += `            df = df[existing_cols]\n`;
                    break;
                case 'DROP_COLUMN':
                    steps += `            if '${action.col}' in df.columns: df.drop(columns=['${action.col}'], inplace=True)\n`;
                    break;
                case 'RENAME':
                    steps += `            df.rename(columns={'${action.col}': '${action.newVal}'}, inplace=True)\n`;
                    break;
                case 'ADD_INDEX':
                    steps += `            df.insert(0, 'ID', range(1, 1 + len(df)))\n`;
                    break;
                case 'DROP_TOP_ROWS':
                    steps += `            df = df.iloc[${action.count}:].reset_index(drop=True)\n`;
                    break;
                case 'PROMOTE_HEADER':
                    steps += `            df.columns = df.iloc[0]; df = df[1:].reset_index(drop=True)\n`;
                    break;
                case 'DUPLICATE':
                    steps += `            if '${action.col}' in df.columns: df['${action.newCol}'] = df['${action.col}']\n`;
                    break;

                // --- TEXTO Y LIMPIEZA ---
                case 'TRIM':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.strip()\n`;
                    break;
                case 'CASE_CHANGE':
                    if (action.mode === 'upper') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.upper()\n`;
                    if (action.mode === 'lower') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.lower()\n`;
                    if (action.mode === 'title') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.title()\n`;
                    break;
                case 'CLEAN_SYMBOLS':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.replace(r'[^a-zA-Z0-9\\s]', '', regex=True)\n`;
                    break;
                case 'REPLACE':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str).str.replace('${action.find}', '${action.replace}', regex=False)\n`;
                    break;
                case 'SPLIT':
                    steps += `            if '${action.col}' in df.columns:\n`;
                    steps += `                split = df['${action.col}'].astype(str).str.split('${action.delim}', n=1, expand=True)\n`;
                    steps += `                df['${action.col}_1'] = split[0]\n`;
                    steps += `                if split.shape[1] > 1: df['${action.col}_2'] = split[1]\n`;
                    break;
                case 'MERGE_COLS':
                    steps += `            df['${action.col1}_${action.col2}'] = df['${action.col1}'].astype(str) + '${action.sep}' + df['${action.col2}'].astype(str)\n`;
                    break;
                case 'AFFIX':
                    if(action.affixType === 'prefix') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = '${action.text}' + df['${action.col}'].astype(str)\n`;
                    else steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str) + '${action.text}'\n`;
                    break;
                case 'SUBSTR':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}_sub'] = df['${action.col}'].astype(str).str[${action.start}:${action.start + action.len}]\n`;
                    break;
                case 'REGEX_EXTRACT':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}_regex'] = df['${action.col}'].astype(str).str.extract(r'(${action.pattern})')[0]\n`;
                    break;

                // --- NULOS Y TIPOS ---
                case 'FILL_NULLS':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}'].fillna('${action.val}', inplace=True)\n`;
                    break;
                case 'FILL_DOWN':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}'].ffill(inplace=True)\n`;
                    break;
                case 'IMPUTE':
                    if (action.method === 'mean') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = pd.to_numeric(df['${action.col}'], errors='coerce').fillna(df['${action.col}'].mean())\n`;
                    if (action.method === 'median') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = pd.to_numeric(df['${action.col}'], errors='coerce').fillna(df['${action.col}'].median())\n`;
                    break;
                case 'CHANGE_TYPE':
                    if (action.to === 'numeric') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = pd.to_numeric(df['${action.col}'], errors='coerce')\n`;
                    if (action.to === 'date') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = pd.to_datetime(df['${action.col}'], errors='coerce')\n`;
                    if (action.to === 'string') steps += `            if '${action.col}' in df.columns: df['${action.col}'] = df['${action.col}'].astype(str)\n`;
                    break;

                // --- FILTROS Y LÓGICA ---
                case 'FILTER':
                    if (action.condition === 'contains') steps += `            df = df[df['${action.col}'].astype(str).str.contains('${action.val}', na=False, case=False)]\n`;
                    if (action.condition === 'equals') steps += `            df = df[df['${action.col}'].astype(str) == '${action.val}']\n`;
                    if (action.condition === 'starts_with') steps += `            df = df[df['${action.col}'].astype(str).str.startswith('${action.val}', na=False)]\n`;
                    if (action.condition === '>') steps += `            df = df[pd.to_numeric(df['${action.col}'], errors='coerce') > ${action.val}]\n`;
                    if (action.condition === '<') steps += `            df = df[pd.to_numeric(df['${action.col}'], errors='coerce') < ${action.val}]\n`;
                    break;
                case 'ADD_CONDITIONAL':
                    // Generación simplificada para condicionales complejas (mejor esfuerzo)
                    steps += `            # Columna Condicional: ${action.newCol}\n`;
                    steps += `            def apply_cond_${action.newCol.replace(/\s/g, '_')}(row):\n`;
                    action.rules.forEach(r => {
                         let cond = 'False';
                         if(r.op === 'equals') cond = `str(row['${r.col}']) == '${r.val}'`;
                         if(r.op === '>') cond = `float(row['${r.col}']) > float(${r.val})`;
                         if(r.op === '<') cond = `float(row['${r.col}']) < float(${r.val})`;
                         if(r.op === 'contains') cond = `'${r.val}'.lower() in str(row['${r.col}']).lower()`;
                         steps += `                if ${cond}: return '${r.output}'\n`;
                    });
                    steps += `                return '${action.elseValue}'\n`;
                    steps += `            df['${action.newCol}'] = df.apply(apply_cond_${action.newCol.replace(/\s/g, '_')}, axis=1)\n`;
                    break;

                // --- CÁLCULOS Y FECHAS ---
                case 'CALC_MATH':
                    steps += `            df['${action.target}'] = pd.to_numeric(df['${action.col1}'], errors='coerce') ${action.op} pd.to_numeric(df['${action.col2}'], errors='coerce')\n`;
                    break;
                case 'ADD_DAYS':
                    steps += `            if '${action.col}' in df.columns: df['${action.col}'] = pd.to_datetime(df['${action.col}'], errors='coerce') + pd.Timedelta(days=${action.days})\n`;
                    break;
                case 'DATE_PART':
                    if (action.part === 'year') steps += `            if '${action.col}' in df.columns: df['${action.col}_year'] = pd.to_datetime(df['${action.col}'], errors='coerce').dt.year\n`;
                    if (action.part === 'month') steps += `            if '${action.col}' in df.columns: df['${action.col}_month'] = pd.to_datetime(df['${action.col}'], errors='coerce').dt.month\n`;
                    break;
                
                // --- DATA SCIENCE ---
                case 'Z-SCORE':
                    steps += `            if '${action.col}' in df.columns:\n                df['${action.col}_zscore'] = (df['${action.col}'] - df['${action.col}'].mean()) / df['${action.col}'].std()\n`;
                    break;
                case 'ONE-HOT':
                    steps += `            if '${action.col}' in df.columns: df = pd.get_dummies(df, columns=['${action.col}'], prefix='${action.col}')\n`;
                    break;
                case 'JSON_EXTRACT':
                    steps += `            import json\n`;
                    steps += `            def get_json(x, k): \n                try: return json.loads(x.replace("'", '"')).get(k, '')\n                except: return ''\n`;
                    steps += `            if '${action.col}' in df.columns: df['${action.col}_${action.key}'] = df['${action.col}'].apply(lambda x: get_json(str(x), '${action.key}'))\n`;
                    break;

                // --- CUSTOM / EJEMPLOS ---
                case 'FROM_EXAMPLES':
                    const r = action.rule;
                    if (r && r.type === 'extract_between') {
                        steps += `            # Inferencia: Extract Between\n`;
                        steps += `            if '${r.col}' in df.columns: df['${action.newCol}'] = df['${r.col}'].astype(str).str.extract(r'${r.startDelim}(.*?)${r.endDelim}')[0]\n`;
                    } else if (r) {
                        steps += `            # Regla inteligente tipo: ${r.type}\n`;
                    }
                    break;
                
                default:
                    steps += `            # Acción '${action.type}' pendiente de mapeo.\n`;
            }
            steps += `            self.log(f"✅ [OK] ${action.description}")\n`;
        });
    }

    return `"""
# -----------------------------------------------------------------------------
# GENERATED BY NOCODEPY - AUTOMATION ENGINE
# -----------------------------------------------------------------------------
# 
# 1. Este código fuente es generado automáticamente por NoCodePY.
# 2. Licencia de uso personal e interno.
# 3. Requiere: pip install pandas numpy openpyxl
# 
# -----------------------------------------------------------------------------
"""
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import pandas as pd
import numpy as np
import os
import threading
import json

# --- CONFIGURACIÓN VISUAL ---
COLOR_BG = "#1e1e1e"
COLOR_PANEL = "#252526"
COLOR_ACCENT = "#029CA3"
COLOR_TEXT = "#FDFDFD"
FONT_MAIN = ("Segoe UI", 10)
FONT_HEADER = ("Segoe UI", 14, "bold")
FONT_MONO = ("Consolas", 9)

class NoCodePYApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NoCodePY | Automation Runtime")
        self.root.geometry("700x600")
        self.root.configure(bg=COLOR_BG)
        self.file_path = None

        header = tk.Frame(root, bg=COLOR_PANEL, height=70); header.pack(fill="x")
        tk.Label(header, text="⚡ NoCodePY", font=FONT_HEADER, bg=COLOR_PANEL, fg=COLOR_ACCENT).place(x=20, y=20)
        
        main = tk.Frame(root, bg=COLOR_BG, padx=25, pady=25); main.pack(fill="both", expand=True)

        tk.Label(main, text="ARCHIVO ORIGEN (.csv / .xlsx)", font=("Segoe UI", 9, "bold"), bg=COLOR_BG, fg="#888").pack(anchor="w")
        frm_in = tk.Frame(main, bg=COLOR_BG, pady=5); frm_in.pack(fill="x")
        self.entry_path = tk.Entry(frm_in, bg="#333", fg="white", font=FONT_MAIN, relief="flat", insertbackground="white")
        self.entry_path.pack(side="left", fill="x", expand=True, ipady=6, padx=(0, 10))
        tk.Button(frm_in, text="📂 Examinar", command=self.select_file, bg="#444", fg="white", relief="flat", padx=15, cursor="hand2").pack(side="right")

        tk.Label(main, text="LOG DE PROCESO", font=("Segoe UI", 9, "bold"), bg=COLOR_BG, fg="#888").pack(anchor="w", pady=(25, 5))
        self.log_area = scrolledtext.ScrolledText(main, height=15, bg="#111", fg="#0f0", font=FONT_MONO, relief="flat", state="disabled", bd=0)
        self.log_area.pack(fill="both", expand=True)

        self.btn_run = tk.Button(main, text="▶ EJECUTAR TRANSFORMACIÓN", command=self.start_thread, bg=COLOR_ACCENT, fg="white", font=("Segoe UI", 11, "bold"), relief="flat", cursor="hand2", pady=12, state="disabled")
        self.btn_run.pack(fill="x", pady=20)

    def log(self, msg):
        self.log_area.config(state="normal"); self.log_area.insert(tk.END, msg + "\\n"); self.log_area.see(tk.END); self.log_area.config(state="disabled")

    def select_file(self):
        fn = filedialog.askopenfilename(filetypes=[("Data Files", "*.csv *.xlsx")])
        if fn:
            self.file_path = fn
            self.entry_path.delete(0, tk.END); self.entry_path.insert(0, fn)
            self.btn_run.config(state="normal", bg=COLOR_ACCENT)
            self.log(f"[INFO] Seleccionado: {os.path.basename(fn)}")

    def start_thread(self): threading.Thread(target=self.run_process).start()

    def run_process(self):
        inp = self.entry_path.get()
        if not inp: return
        self.btn_run.config(state="disabled", text="PROCESANDO...", bg="#444")
        self.log("-" * 60); self.log(f"[INICIO] Motor ETL iniciado")
        try:
            if inp.endswith('.csv'): df = pd.read_csv(inp)
            else: df = pd.read_excel(inp)
            self.log(f"[CARGA] {len(df)} filas cargadas.")

${steps}
            
            out = os.path.splitext(inp)[0] + "_nocodepy.csv"
            df.to_csv(out, index=False)
            self.log("-" * 60); self.log(f"🚀 [EXITO] Guardado: {os.path.basename(out)}")
            messagebox.showinfo("Completado", f"Archivo generado:\\n{os.path.basename(out)}")
        except Exception as e:
            self.log(f"❌ [ERROR]: {str(e)}")
            messagebox.showerror("Error", str(e))
        finally:
            self.btn_run.config(state="normal", text="▶ EJECUTAR TRANSFORMACIÓN", bg=COLOR_ACCENT)

if __name__ == "__main__":
    root = tk.Tk(); app = NoCodePYApp(root); root.mainloop()
`;
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
        
        {/* HEADER ELEGANTE */}
        <div className="p-6 border-b border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light">
           <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc mb-2 flex items-center gap-2"><Package className="text-persian" /> Export Hub</h2>
                <p className="text-gray-500 dark:text-wolf text-sm">Descarga tus datos procesados o genera código de automatización.</p>
             </div>
             {/* Indicador de estado */}
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-persian/10 text-persian rounded-full text-xs font-bold border border-persian/20">
               <Database size={12} /> {data.length} Filas listas
             </div>
           </div>
           
           {/* TABS ESTILIZADOS */}
           <div className="flex gap-8 mt-8 border-b border-gray-200 dark:border-wolf/10 text-sm">
              <button onClick={() => setActiveTab('files')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'files' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <FileSpreadsheet size={16}/> 1. Archivos
              </button>
              <button onClick={() => setActiveTab('sql')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'sql' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <Database size={16}/> 2. SQL Generator
              </button>
              <button onClick={() => setActiveTab('code')} className={`pb-3 px-1 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'code' ? 'text-persian border-persian' : 'text-gray-400 border-transparent hover:text-gray-600 dark:text-wolf dark:hover:text-white'}`}>
                <Terminal size={16}/> 3. Python App
              </button>
           </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-black/20 overflow-auto custom-scrollbar">
          {!data.length ? (
             <div className="h-full flex flex-col items-center justify-center opacity-50">
               <div className="w-20 h-20 bg-gray-200 dark:bg-wolf/10 rounded-full flex items-center justify-center mb-6">
                 <Package size={40} className="text-gray-400 dark:text-wolf"/>
               </div>
               <h3 className="text-lg font-bold text-gray-500">Sin datos para exportar</h3>
               <p className="text-sm text-gray-400">Carga un archivo en la sección "Datos" primero.</p>
             </div>
          ) : (
            <>
              {/* TAB 1: ARCHIVOS (GRID BONITO) */}
              {activeTab === 'files' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full max-w-5xl mx-auto items-start pt-8 animate-in slide-in-from-bottom-4">
                  
                  {/* CSV CARD */}
                  <div onClick={downloadCSV} className="cursor-pointer group bg-white dark:bg-carbon border-2 border-dashed border-gray-200 dark:border-wolf/20 hover:border-green-500 dark:hover:border-green-500 rounded-2xl p-10 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="p-5 bg-green-50 dark:bg-green-900/10 rounded-full mb-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform shadow-sm">
                      <FileSpreadsheet size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">CSV / Excel</h3>
                    <p className="text-sm text-gray-500 dark:text-wolf">Formato universal compatible con Excel, PowerBI y Tableau.</p>
                    <span className="mt-6 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">Recomendado</span>
                  </div>

                  {/* JSON CARD */}
                  <div onClick={downloadJSON} className="cursor-pointer group bg-white dark:bg-carbon border-2 border-dashed border-gray-200 dark:border-wolf/20 hover:border-yellow-500 dark:hover:border-yellow-500 rounded-2xl p-10 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-full mb-6 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform shadow-sm">
                      <FileJson size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">JSON (API)</h3>
                    <p className="text-sm text-gray-500 dark:text-wolf">Estructura ligera ideal para desarrolladores y APIs web.</p>
                  </div>

                </div>
              )}

              {/* TAB 2: SQL (EDITOR OSCURO) */}
              {activeTab === 'sql' && (
                <div className="h-full flex flex-col gap-4 relative animate-in fade-in">
                  <div className="flex justify-between items-center mb-2 px-1">
                      <div className="text-xs font-mono text-gray-500 dark:text-wolf flex items-center gap-2">
                        <Database size={12}/> script_export.sql
                      </div>
                      <button onClick={() => copyToClipboard(generateSQL())} className="flex items-center gap-2 text-xs font-bold bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-persian/20 active:scale-95">
                          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar SQL'}
                      </button>
                  </div>
                  <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-700 custom-scrollbar shadow-inner text-left relative group">
                    <pre className="text-sm font-mono text-zinc whitespace-pre-wrap leading-relaxed selection:bg-persian/30">
                        <code className="language-sql">{generateSQL()}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: PYTHON (EDITOR OSCURO) */}
              {activeTab === 'code' && (
                <div className="h-full flex flex-col gap-4 relative animate-in fade-in">
                  <div className="flex justify-between items-center mb-2 px-1">
                      <div className="text-xs font-mono text-gray-500 dark:text-wolf flex items-center gap-2">
                        <Terminal size={12}/> app.py (Tkinter + Pandas)
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1">
                           <ShieldAlert size={10}/> Uso personal
                        </span>
                        <button onClick={() => copyToClipboard(generatePythonGUI())} className="flex items-center gap-2 text-xs font-bold bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-persian/20 active:scale-95">
                            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar Código'}
                        </button>
                      </div>
                  </div>
                  
                  <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 overflow-auto border border-gray-700 custom-scrollbar shadow-inner text-left relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-zinc selection:bg-persian/30">
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