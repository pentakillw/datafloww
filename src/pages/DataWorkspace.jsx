import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, CheckCircle2, 
  Trash2, ArrowRight, FileSpreadsheet, Loader2
} from 'lucide-react';

export default function DataWorkspace() {
  const { data, setData, columns, setColumns, setFileName, setHistory } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setFileName(file.name);

    const processData = (jsonData) => {
      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0]));
        setData(jsonData);
        setHistory([]);
      } else {
        setError('El archivo parece estar vacío.');
      }
      setLoading(false);
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data),
        error: (err) => { setError('Error CSV: ' + err.message); setLoading(false); }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          processData(XLSX.utils.sheet_to_json(ws));
        } catch (err) {
          setError('Error Excel: ' + err.message);
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Formato no soportado.');
      setLoading(false);
    }
  };

  const clearData = () => {
    setData([]);
    setColumns([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
        
        {/* Header de la Tarjeta */}
        <div className="p-6 border-b border-gray-200 dark:border-wolf/20 flex justify-between items-center bg-white dark:bg-carbon-light">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc flex items-center gap-2">
              <FileSpreadsheet className="text-persian" size={24}/> Carga de Datos
            </h2>
            <p className="text-gray-500 dark:text-wolf text-sm mt-1">Importa tus archivos crudos (.csv, .xlsx) para comenzar.</p>
          </div>
          
          {data.length > 0 && (
            <div className="flex gap-3">
               <button onClick={clearData} className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                 <Trash2 size={16} /> Descartar
               </button>
               <button 
                onClick={() => navigate('/transform')}
                className="bg-persian hover:bg-sea text-white px-6 py-2 rounded-lg font-semibold flex items-center shadow-lg shadow-persian/20 transition-all active:scale-95"
              >
                Ir a Transformar <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="flex-1 bg-gray-50 dark:bg-black/20 relative overflow-hidden flex flex-col">
          {data.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div 
                className="w-full max-w-xl border-2 border-dashed border-gray-300 dark:border-wolf/20 rounded-2xl p-12 flex flex-col items-center justify-center bg-white dark:bg-carbon hover:border-persian/50 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-20 h-20 bg-persian/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud size={40} className="text-persian" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">Haz clic o arrastra tu archivo aquí</h3>
                <p className="text-gray-500 dark:text-wolf mb-8">Soportamos archivos grandes de Excel y CSV</p>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv,.xlsx,.xls" />
                <button className="bg-persian hover:bg-sea text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'Seleccionar Archivo'}
                </button>
              </div>
              {error && <div className="mt-6 text-red-500 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/20">{error}</div>}
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white dark:bg-carbon rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 dark:bg-carbon-light sticky top-0 z-10">
                    <tr>
                      <th className="p-3 border-b border-gray-200 dark:border-wolf/20 text-xs font-mono text-gray-500 dark:text-wolf">#</th>
                      {columns.map((col, idx) => (
                        <th key={idx} className="p-3 border-b border-gray-200 dark:border-wolf/20 text-xs font-bold uppercase text-gray-500 dark:text-wolf whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 100).map((row, i) => (
                      <tr key={i} className="hover:bg-persian/5 border-b border-gray-100 dark:border-wolf/5 transition-colors">
                        <td className="p-3 text-xs text-gray-400 font-mono border-r border-gray-100 dark:border-wolf/10">{i + 1}</td>
                        {columns.map((col, j) => (
                          <td key={j} className="p-3 text-sm text-gray-700 dark:text-zinc/80 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                 <div className="bg-persian/10 text-persian px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-persian/20">
                    <CheckCircle2 size={16} /> {data.length} filas cargadas correctamente. (Mostrando vista previa de 100)
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}