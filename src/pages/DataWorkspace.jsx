import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, CheckCircle2, 
  Trash2, ArrowRight, FileSpreadsheet, Loader2,
  Table, X, Grid3X3, Layers, ScanLine, AlertCircle
} from 'lucide-react';

export default function DataWorkspace() {
  const { data, setData, columns, setColumns, setFileName, setHistory } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [availableSources, setAvailableSources] = useState([]); 
  const [tempWorkbook, setTempWorkbook] = useState(null);
  const [tempFileName, setTempFileName] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ----------------------------------------------------------------------
  // 1. ALGORITMO DETECCIÓN DE ISLAS (CORREGIDO CON OFFSETS)
  // ----------------------------------------------------------------------
  const detectDataBlocks = (ws, sheetName) => {
      const blocks = [];
      
      // A. Obtener el rango real de la hoja para calcular offsets
      const ref = ws['!ref'];
      if (!ref) return []; // Hoja vacía
      
      const rangeDecoded = XLSX.utils.decode_range(ref);
      const startRowOffset = rangeDecoded.s.r; // Fila inicial real (ej: 3 si empieza en fila 4)
      const startColOffset = rangeDecoded.s.c; // Col inicial real (ej: 9 si empieza en J)

      // B. Extraer datos crudos relativos
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
      
      if (!rows || rows.length === 0) return [];

      let inBlock = false;
      let blockStartRelRow = 0; // Fila relativa al array rows
      let minRelCol = Infinity;
      let maxRelCol = -1;

      for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const hasData = row && row.some(cell => cell !== null && cell !== "");
          
          if (hasData) {
              if (!inBlock) {
                  inBlock = true;
                  blockStartRelRow = i;
                  minRelCol = Infinity;
                  maxRelCol = -1;
              }
              
              row.forEach((cell, colIdx) => {
                  if (cell !== null && cell !== "") {
                      if (colIdx < minRelCol) minRelCol = colIdx;
                      if (colIdx > maxRelCol) maxRelCol = colIdx;
                  }
              });

          } else {
              if (inBlock) {
                  inBlock = false;
                  // Guardar bloque si tiene dimensiones válidas
                  if (maxRelCol >= minRelCol) {
                      // C. CALCULAR COORDENADAS ABSOLUTAS (Excel A1 notation)
                      // Sumamos el offset inicial de la hoja a lo encontrado en el array
                      const absStartR = startRowOffset + blockStartRelRow;
                      const absEndR = startRowOffset + (i - 1);
                      const absStartC = startColOffset + minRelCol;
                      const absEndC = startColOffset + maxRelCol;

                      const range = XLSX.utils.encode_range({
                          s: { c: absStartC, r: absStartR },
                          e: { c: absEndC, r: absEndR }
                      });

                      blocks.push({
                          id: `auto-${sheetName}-${absStartR}`,
                          name: `Bloque (Fila ${absStartR + 1})`,
                          type: 'auto-table',
                          ref: range,
                          sheet: sheetName,
                          description: `Rango ${range}`
                      });
                  }
              }
          }
      }

      // Bloque final (si el archivo acaba con datos)
      if (inBlock && maxRelCol >= minRelCol) {
          const absStartR = startRowOffset + blockStartRelRow;
          const absEndR = startRowOffset + (rows.length - 1);
          const absStartC = startColOffset + minRelCol;
          const absEndC = startColOffset + maxRelCol;

          const range = XLSX.utils.encode_range({
              s: { c: absStartC, r: absStartR },
              e: { c: absEndC, r: absEndR }
          });

          blocks.push({
              id: `auto-${sheetName}-${absStartR}`,
              name: `Bloque (Fila ${absStartR + 1})`,
              type: 'auto-table',
              ref: range,
              sheet: sheetName,
              description: `Rango ${range}`
          });
      }

      return blocks;
  };

  // ----------------------------------------------------------------------
  // 2. HELPER: NORMALIZAR MATRIZ (TRIM BORDES VACÍOS)
  // ----------------------------------------------------------------------
  const normalizeMatrix = (matrix) => {
      if (!matrix || matrix.length === 0) return [];

      // 1. Trim Vertical (Filas vacías arriba/abajo)
      let firstRow = -1;
      let lastRow = -1;
      for (let i = 0; i < matrix.length; i++) {
          const hasData = matrix[i] && matrix[i].some(cell => cell !== null && cell !== undefined && String(cell).trim() !== "");
          if (hasData) {
              if (firstRow === -1) firstRow = i;
              lastRow = i;
          }
      }
      if (firstRow === -1) return []; // Todo vacío

      const rowsTrimmed = matrix.slice(firstRow, lastRow + 1);

      // 2. Trim Horizontal (Cols vacías izq/der)
      let firstCol = Infinity;
      let lastCol = -1;

      rowsTrimmed.forEach(row => {
          row.forEach((cell, idx) => {
              if (cell !== null && cell !== undefined && String(cell).trim() !== "") {
                  if (idx < firstCol) firstCol = idx;
                  if (idx > lastCol) lastCol = idx;
              }
          });
      });

      if (firstCol === Infinity) return [];

      // Recortar y devolver
      return rowsTrimmed.map(row => row.slice(firstCol, lastCol + 1));
  };

  // ----------------------------------------------------------------------
  // 3. PROCESAMIENTO FINAL
  // ----------------------------------------------------------------------
  const processData = (jsonData, fName) => {
    if (jsonData && jsonData.length > 0) {
      // Intentar obtener keys de la primera fila
      const rawKeys = Object.keys(jsonData[0]);
      if (rawKeys.length === 0) {
          setError('La tabla seleccionada no tiene columnas válidas.');
          setLoading(false);
          return;
      }

      setColumns(rawKeys);
      setData(jsonData);
      setHistory([]);
      setFileName(fName);
      
      setTempWorkbook(null);
      setAvailableSources([]);
      setShowSourceModal(false);
    } else {
      setError('El origen seleccionado parece estar vacío.');
    }
    setLoading(false);
  };

  // 4. LECTURA INICIAL
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    if (file.name.endsWith('.csv')) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data, file.name),
        error: (err) => { setError('Error CSV: ' + err.message); setLoading(false); }
      });
      return;
    } 
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setTempFileName(file.name);
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const sources = [];

          wb.SheetNames.forEach(sheetName => {
              // A) Hoja completa
              sources.push({ 
                  id: `sheet-${sheetName}`,
                  name: sheetName, 
                  type: 'sheet', 
                  description: 'Hoja Completa' 
              });

              // B) Bloques/Islas (Con algoritmo corregido)
              const ws = wb.Sheets[sheetName];
              const detectedBlocks = detectDataBlocks(ws, sheetName);
              // Solo agregamos bloques si encontramos más de 1, o si el bloque es claramente un subconjunto
              detectedBlocks.forEach(block => sources.push(block));
          });

          // C) Tablas definidas (Metadata)
          if (wb.Workbook && wb.Workbook.Names) {
              wb.Workbook.Names.forEach((definedName, idx) => {
                  const name = definedName.Name;
                  if (name && !name.startsWith('_') && !name.includes('Print_Area')) {
                      sources.push({ 
                          id: `table-${idx}`,
                          name: name, 
                          type: 'table', 
                          ref: definedName.Ref, 
                          description: 'Tabla Definida'
                      });
                  }
              });
          }

          setTempWorkbook(wb);
          setAvailableSources(sources);
          setShowSourceModal(true);
          setLoading(false);

        } catch (err) {
          setError('Error Excel: ' + err.message);
          setLoading(false);
        }
      };
    } else {
      setError('Formato inválido.');
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // 5. EXTRACCIÓN Y CONSTRUCCIÓN (SEGURA)
  // ----------------------------------------------------------------------
  const handleSourceSelect = (source) => {
      setLoading(true);
      setTimeout(() => {
          try {
              let ws = null;
              let rawData = [];

              if (source.type === 'sheet') {
                  ws = tempWorkbook.Sheets[source.name];
                  rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
              } else {
                  // MODO TABLA / AUTO-TABLE
                  let sheetName = "";
                  let range = "";

                  if (source.type === 'auto-table') {
                      sheetName = source.sheet;
                      range = source.ref;
                  } else {
                      // Parsear "Sheet1!J4:K7"
                      const fullRef = source.ref; 
                      const splitIdx = fullRef.lastIndexOf('!');
                      if (splitIdx !== -1) {
                          sheetName = fullRef.substring(0, splitIdx).replace(/^'|'$/g, '');
                          range = fullRef.substring(splitIdx + 1);
                      } else {
                          sheetName = tempWorkbook.SheetNames[0];
                          range = fullRef;
                      }
                  }

                  ws = tempWorkbook.Sheets[sheetName];
                  if (!ws) throw new Error("Hoja no encontrada");
                  
                  // Extraer SOLO el rango exacto
                  rawData = XLSX.utils.sheet_to_json(ws, { range: range, header: 1, defval: null });
              }

              // Normalizar (quitar filas/cols vacías internas si la selección fue generosa)
              const cleanMatrix = normalizeMatrix(rawData);

              if (!cleanMatrix || cleanMatrix.length < 2) {
                  throw new Error("La selección no contiene datos tabulares válidos (mínimo header + 1 fila).");
              }

              // Construir JSON
              const headers = cleanMatrix[0];
              const body = cleanMatrix.slice(1);

              const finalHeaders = headers.map((h, idx) => {
                  return (h !== null && h !== undefined && String(h).trim() !== '') 
                      ? String(h).trim() 
                      : `Col_${idx + 1}`;
              });

              const json = body.map(row => {
                  const obj = {};
                  let hasData = false;
                  finalHeaders.forEach((header, idx) => {
                      const val = row[idx];
                      if (val !== null && val !== undefined && String(val).trim() !== "") hasData = true;
                      obj[header] = (val !== undefined) ? val : null;
                  });
                  return hasData ? obj : null;
              }).filter(r => r !== null);

              processData(json, `${tempFileName} [${source.name}]`);

          } catch (err) {
              console.error(err);
              setError("Error al procesar: " + err.message);
              setLoading(false);
          }
      }, 100);
  };

  const cancelImport = () => {
      setShowSourceModal(false);
      setTempWorkbook(null);
      setAvailableSources([]);
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearData = () => {
    setData([]);
    setColumns([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      
      {/* MODAL */}
      {showSourceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-wolf/20 flex flex-col overflow-hidden max-h-[85vh]">
                  
                  <div className="p-5 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                      <div>
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                            <Layers size={20} className="text-persian"/> Selecciona Origen
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-wolf mt-1">
                           Estructuras detectadas en el archivo:
                        </p>
                      </div>
                      <button onClick={cancelImport} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-red-500">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-gray-100/50 dark:bg-black/20">
                      <div className="space-y-2">
                          {availableSources.map((src) => (
                              <button 
                                key={src.id}
                                onClick={() => handleSourceSelect(src)}
                                className="w-full text-left p-4 rounded-xl bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 hover:border-persian hover:shadow-md hover:bg-persian/5 dark:hover:bg-persian/10 transition-all flex items-center justify-between group relative overflow-hidden"
                              >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-persian transition-colors"></div>
                                  <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-lg shadow-sm transition-transform group-hover:scale-110 ${
                                          src.type === 'sheet' 
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                                            : (src.type === 'table' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400')
                                      }`}>
                                        {src.type === 'sheet' && <FileSpreadsheet size={24} />}
                                        {src.type === 'table' && <Table size={24} />}
                                        {src.type === 'auto-table' && <ScanLine size={24} />}
                                      </div>
                                      <div>
                                        <span className="block font-bold text-gray-800 dark:text-zinc text-sm group-hover:text-persian mb-0.5">{src.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                                src.type === 'sheet' ? 'bg-green-50 text-green-600 dark:bg-green-900/10' : 
                                                src.type === 'table' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/10' :
                                                'bg-purple-50 text-purple-600 dark:bg-purple-900/10'
                                            }`}>
                                                {src.type === 'sheet' ? 'HOJA' : src.type === 'table' ? 'TABLA' : 'AUTO'}
                                            </span>
                                            {src.type !== 'sheet' && <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">{src.ref || src.description}</span>}
                                        </div>
                                      </div>
                                  </div>
                                  <ArrowRight size={18} className="text-gray-300 group-hover:text-persian opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0"/>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- MAIN UI --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
        <div className="p-6 border-b border-gray-200 dark:border-wolf/20 flex justify-between items-center bg-white dark:bg-carbon-light">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc flex items-center gap-2">
              <UploadCloud className="text-persian" size={24}/> Fuente de Datos
            </h2>
            <p className="text-gray-500 dark:text-wolf text-sm mt-1">Sube CSV o Excel (.xlsx).</p>
          </div>
          {data.length > 0 && (
            <div className="flex gap-3">
               <button onClick={clearData} className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                 <Trash2 size={16} /> Limpiar
               </button>
               <button onClick={() => navigate('/transform')} className="bg-persian hover:bg-sea text-white px-6 py-2 rounded-lg font-semibold flex items-center shadow-lg shadow-persian/20 transition-all active:scale-95">
                Ir a Transformar <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-gray-50 dark:bg-black/20 relative overflow-hidden flex flex-col">
          {data.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div 
                className="w-full max-w-xl border-2 border-dashed border-gray-300 dark:border-wolf/20 rounded-2xl p-12 flex flex-col items-center justify-center bg-white dark:bg-carbon hover:border-persian/50 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-20 h-20 bg-persian/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud size={40} className="text-persian" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">Arrastra tu archivo aquí</h3>
                <p className="text-gray-500 dark:text-wolf mb-8 max-w-xs mx-auto">Detectamos hojas y tablas automáticamente.</p>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv,.xlsx,.xls" onClick={(e) => { e.target.value = null }} />
                <button className="bg-persian hover:bg-sea text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transform transition-transform group-hover:-translate-y-1">
                  {loading ? <Loader2 className="animate-spin" /> : 'Seleccionar Archivo'}
                </button>
              </div>
              {error && (
                  <div className="mt-6 text-red-500 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/20 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                      <AlertCircle size={16}/> {error}
                  </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white dark:bg-carbon rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden">
                <div className="bg-gray-100 dark:bg-carbon-light px-4 py-2 border-b border-gray-200 dark:border-wolf/20 flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-wolf">
                    <Grid3X3 size={12} /> VISTA PREVIA
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-black/20 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 border-b border-gray-200 dark:border-wolf/20 text-xs font-mono text-gray-400 dark:text-wolf w-12 text-center">#</th>
                      {columns.map((col, idx) => (
                        <th key={idx} className="p-3 border-b border-gray-200 dark:border-wolf/20 text-xs font-bold uppercase text-gray-600 dark:text-wolf whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-wolf/5">
                    {data.slice(0, 100).map((row, i) => (
                      <tr key={i} className="hover:bg-persian/5 transition-colors">
                        <td className="p-3 text-xs text-gray-400 font-mono border-r border-gray-100 dark:border-wolf/10 text-center">{i + 1}</td>
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
                    <CheckCircle2 size={16} /> {data.length.toLocaleString()} filas cargadas.
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}