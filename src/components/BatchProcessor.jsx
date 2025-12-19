import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { UploadCloud, FileSpreadsheet, Play, Download, CheckCircle2, AlertCircle, Loader2, X, Archive } from 'lucide-react';

export default function BatchProcessor() {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [processedFiles, setProcessedFiles] = useState([]); // { name, blob }
    const [selectedRecipe, setSelectedRecipe] = useState('auto_clean');

    // Load custom rules from localStorage
    const customRules = React.useMemo(() => {
        try {
            const stored = localStorage.getItem('nocodepy_automation_rules');
            return stored ? JSON.parse(stored).filter(r => r.active) : [];
        } catch { return []; }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                file: f,
                status: 'pending', // pending, processing, done, error
                result: null
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processFiles = async () => {
        setProcessing(true);
        setProgress(0);
        setProcessedFiles([]);

        const results = [];
        const total = files.length;

        for (let i = 0; i < total; i++) {
            const fileObj = files[i];
            
            // Update UI status
            setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));

            try {
                // 1. Read File
                const data = await readFile(fileObj.file);
                
                // 2. Determine Actions based on Recipe
                let actions = [];
                if (selectedRecipe === 'auto_clean') {
                    actions = [{ type: 'SMART_CLEAN' }, { type: 'DROP_DUPLICATES' }, { type: 'TRIM', col: '*' }]; // * needs handling in engine or loop
                } else if (selectedRecipe === 'json_export') {
                    // Just conversion, no transform actions needed essentially, but maybe clean first
                    actions = [{ type: 'SMART_CLEAN' }];
                } else if (selectedRecipe.startsWith('rule_')) {
                    const ruleId = selectedRecipe.replace('rule_', '');
                    const rule = customRules.find(r => r.id === ruleId);
                    if (rule) {
                        if (rule.action.type === 'auto_clean') actions = [{ type: 'SMART_CLEAN' }];
                        // Add more mappings here based on AutomationHub rule structure
                    }
                }

                // 3. Apply Transform via Web Worker
                const result = await new Promise((resolve, reject) => {
                    const worker = new Worker(new URL('../workers/transform.worker.js', import.meta.url), { type: 'module' });
                    
                    worker.onmessage = (e) => {
                        const { type, payload } = e.data;
                        if (type === 'BATCH_COMPLETE') {
                            resolve(payload);
                            worker.terminate();
                        } else if (type === 'BATCH_ERROR') {
                            reject(new Error(payload));
                            worker.terminate();
                        }
                    };

                    worker.onerror = (err) => {
                        reject(err);
                        worker.terminate();
                    };

                    worker.postMessage({ 
                        type: 'PROCESS_BATCH', 
                        payload: { data: data.rows, columns: data.columns, actions } 
                    });
                });

                const { data: transformedData, columns: transformedCols } = result;

                // 4. Generate Output
                let outputBlob;
                let extension = 'xlsx';

                if (selectedRecipe === 'json_export') {
                    const jsonStr = JSON.stringify(transformedData, null, 2);
                    outputBlob = new Blob([jsonStr], { type: 'application/json' });
                    extension = 'json';
                } else {
                    // Export back to XLSX
                    const ws = XLSX.utils.json_to_sheet(transformedData, { header: transformedCols });
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    outputBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                }

                const resultFileName = `processed_${fileObj.file.name.split('.')[0]}.${extension}`;
                
                results.push({ name: resultFileName, blob: outputBlob });
                
                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));

            } catch (err) {
                console.error(err);
                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
            }

            setProgress(((i + 1) / total) * 100);
        }

        setProcessedFiles(results);
        setProcessing(false);
    };

    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    if (jsonData.length === 0) resolve({ rows: [], columns: [] });

                    const headers = jsonData[0];
                    const rows = XLSX.utils.sheet_to_json(sheet); // Auto-parser
                    
                    resolve({ rows, columns: headers });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        processedFiles.forEach(f => {
            zip.file(f.name, f.blob);
        });
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "batch_processed_files.zip";
        a.click();
    };

    return (
        <div className="bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileSpreadsheet className="text-persian" /> Procesamiento por Lotes
            </h2>

            {/* 1. Selector de Receta */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transformación a aplicar</label>
                <select 
                    value={selectedRecipe} 
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-lg px-4 py-2 outline-none focus:border-persian transition-all"
                >
                    <option value="auto_clean">✨ Limpieza Inteligente (Estándar)</option>
                    <option value="json_export">📦 Convertir a JSON</option>
                    <optgroup label="Mis Reglas de Automatización">
                        {customRules.map(r => (
                            <option key={r.id} value={`rule_${r.id}`}>{r.name}</option>
                        ))}
                    </optgroup>
                </select>
            </div>

            {/* 2. Upload Area */}
            <div className="border-2 border-dashed border-gray-200 dark:border-wolf/20 rounded-xl p-8 text-center bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative mb-6">
                <input 
                    type="file" 
                    multiple 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={processing}
                />
                <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Arrastra archivos Excel o haz clic</p>
                <p className="text-xs text-gray-400 mt-1">Soporta múltiples archivos simultáneos</p>
            </div>

            {/* 3. File List */}
            {files.length > 0 && (
                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-wolf/10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {f.status === 'pending' && <FileSpreadsheet size={16} className="text-gray-400" />}
                                {f.status === 'processing' && <Loader2 size={16} className="text-persian animate-spin" />}
                                {f.status === 'done' && <CheckCircle2 size={16} className="text-green-500" />}
                                {f.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                                <span className="text-sm truncate text-gray-700 dark:text-gray-300">{f.file.name}</span>
                            </div>
                            {f.status === 'pending' && !processing && (
                                <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 4. Actions */}
            <div className="flex gap-3">
                <button 
                    onClick={processFiles} 
                    disabled={files.length === 0 || processing}
                    className="flex-1 bg-persian hover:bg-sea disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-persian/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {processing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                    {processing ? 'Procesando...' : 'Iniciar Proceso'}
                </button>

                {processedFiles.length > 0 && !processing && (
                    <button 
                        onClick={downloadZip}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 animate-in slide-in-from-bottom"
                    >
                        <Archive size={18} /> Descargar ZIP
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            {processing && (
                <div className="mt-4 w-full bg-gray-200 dark:bg-wolf/20 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-persian h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            )}
        </div>
    );
}
