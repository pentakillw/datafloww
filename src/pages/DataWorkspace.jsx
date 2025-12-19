import React, { useRef, useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { useDataTransform } from '../hooks/useDataTransform';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/i18n.jsx';
import { 
  UploadCloud, CheckCircle2, ArrowRight, FileSpreadsheet, Loader2,
  Table, X, Grid3X3, Layers, AlertCircle, Crown, HardDrive, Lock, AlertTriangle, Zap, RefreshCw, Trash2, Folder, Search, Filter, Calendar
} from 'lucide-react';

export default function DataWorkspace() {
  const { 
    data, columns, setFileName, 
    loadNewData, updateDataState,
    userTier, planLimits, showToast, 
    cloudFiles, trashFiles, registerFile, updateExistingFile, deleteFile, restoreFile, permanentDeleteFile, canUploadNew, filesUploadedCount, resetWorkspace,
    checkAutomationRules, projects, assignFileToProject
  } = useData();

  const transform = useDataTransform(); 
  
  const [showTrash, setShowTrash] = useState(false); // Estado para ver papelera
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de Búsqueda Avanzada
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [availableSources, setAvailableSources] = useState([]); 
  const [tempWorkbook, setTempWorkbook] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const [tempFileSize, setTempFileSize] = useState("");
  const [tempDataToProcess, setTempDataToProcess] = useState(null); // Estado para guardar datos mientras se decide duplicado

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, fileId: null, title: '', message: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [duplicateModal, setDuplicateModal] = useState({ isOpen: false, existingFile: null, newData: null, fName: '', fSize: '' });
  const [projectAssignModal, setProjectAssignModal] = useState({ isOpen: false, fileId: null });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  // --- FILTRADO AVANZADO ---
  const filteredFiles = useMemo(() => {
      let files = showTrash ? trashFiles : cloudFiles;

      // 1. Búsqueda de Texto (Nombre o Proyecto)
      if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          files = files.filter(f => {
              const pName = projects.find(p => p.id === f.projectId)?.name.toLowerCase() || '';
              return f.filename.toLowerCase().includes(lowerQ) || pName.includes(lowerQ);
          });
      }

      // 2. Filtro por Proyecto
      if (filterProject !== 'all') {
          if (filterProject === 'none') {
              files = files.filter(f => !f.projectId);
          } else {
              files = files.filter(f => f.projectId === filterProject);
          }
      }

      return files;
  }, [cloudFiles, trashFiles, showTrash, searchQuery, filterProject, projects]);

  // --- DETECCIÓN DE ISLAS (OFFSET CORRECTO) ---
  const detectDataBlocks = (ws, sheetName) => {
      const blocks = [];
      const ref = ws['!ref'];
      if (!ref) return [];
      
      const rangeDecoded = XLSX.utils.decode_range(ref);
      const startRowOffset = rangeDecoded.s.r; 
      const startColOffset = rangeDecoded.s.c; 

      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
      if (!rows || rows.length === 0) return [];

      let inBlock = false, blockStartRelRow = 0, minRelCol = Infinity, maxRelCol = -1;

      for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const hasData = row && row.some(cell => cell !== null && cell !== "");
          if (hasData) {
              if (!inBlock) { inBlock = true; blockStartRelRow = i; minRelCol = Infinity; maxRelCol = -1; }
              row.forEach((cell, colIdx) => { if (cell !== null && cell !== "") { if (colIdx < minRelCol) minRelCol = colIdx; if (colIdx > maxRelCol) maxRelCol = colIdx; } });
          } else {
              if (inBlock) { inBlock = false; if (maxRelCol >= minRelCol) {
                      const absStartR = startRowOffset + blockStartRelRow; const absEndR = startRowOffset + (i - 1); const absStartC = startColOffset + minRelCol; const absEndC = startColOffset + maxRelCol;
                      const range = XLSX.utils.encode_range({ s: { c: absStartC, r: absStartR }, e: { c: absEndC, r: absEndR } });
                      blocks.push({ id: `auto-${sheetName}-${absStartR}`, name: `Bloque (Fila ${absStartR + 1})`, type: 'auto-table', ref: range, sheet: sheetName, description: `Rango ${range}` });
                  } }
          }
      }
      if (inBlock && maxRelCol >= minRelCol) {
          const absStartR = startRowOffset + blockStartRelRow; const absEndR = startRowOffset + (rows.length - 1); const absStartC = startColOffset + minRelCol; const absEndC = startColOffset + maxRelCol;
          const range = XLSX.utils.encode_range({ s: { c: absStartC, r: absStartR }, e: { c: absEndC, r: absEndR } });
          blocks.push({ id: `auto-${sheetName}-${absStartR}`, name: `Bloque (Fila ${absStartR + 1})`, type: 'auto-table', ref: range, sheet: sheetName, description: `Rango ${range}` });
      }
      return blocks;
  };

  // --- NORMALIZAR MATRIZ ---
  const normalizeMatrix = (matrix) => {
      if (!matrix || matrix.length === 0) return [];
      let firstRow = -1, lastRow = -1;
      for (let i = 0; i < matrix.length; i++) { const hasData = matrix[i] && matrix[i].some(c => c !== null && c !== undefined && String(c).trim() !== ""); if (hasData) { if (firstRow === -1) firstRow = i; lastRow = i; } }
      if (firstRow === -1) return [];
      const rowsTrimmed = matrix.slice(firstRow, lastRow + 1);
      let firstCol = Infinity, lastCol = -1;
      rowsTrimmed.forEach(row => { row.forEach((cell, idx) => { if (cell !== null && cell !== undefined && String(cell).trim() !== "") { if (idx < firstCol) firstCol = idx; if (idx > lastCol) lastCol = idx; } }); });
      if (firstCol === Infinity) return [];
      return rowsTrimmed.map(row => row.slice(firstCol, lastCol + 1));
  };

  // --- PROCESAMIENTO FINAL ---
  const processData = async (jsonData, fName, fSize) => {
    if (jsonData && jsonData.length > 0) {
      let finalData = jsonData;
      const rowLimit = planLimits.maxRows;
      
      if (jsonData.length > rowLimit) {
          finalData = jsonData.slice(0, rowLimit);
          showToast(`⚠️ Plan ${userTier.toUpperCase()}: Recortado a ${rowLimit.toLocaleString()} filas.`, 'warning');
      }

      const rawKeys = Object.keys(finalData[0]);
      if (rawKeys.length === 0) { setError('Sin columnas válidas.'); setLoading(false); return; }

      // --- DETECCIÓN DE DUPLICADOS ---
      const existingFile = cloudFiles.find(f => f.filename === fName);
      if (existingFile) {
          setDuplicateModal({
              isOpen: true,
              existingFile,
              newData: finalData,
              fName,
              fSize
          });
          setLoading(false);
          return; // Detenemos flujo hasta decisión del usuario
      }

      await finalizeRegistration(finalData, fName, fSize);
    } else {
      setError('El origen seleccionado parece estar vacío.');
      setLoading(false);
    }
  };

  const finalizeRegistration = async (finalData, fName, fSize, existingFileId = null) => {
      setLoading(true);
      const rawKeys = Object.keys(finalData[0]);
      
      // 1. REGISTRAR O ACTUALIZAR
      let registration;
      if (existingFileId) {
          registration = await updateExistingFile(existingFileId, finalData.length, fSize);
      } else {
          registration = await registerFile(fName, finalData.length, fSize);
      }
      
      // 2. CARGAR DATOS CRUDOS
      loadNewData(finalData, rawKeys, fName);

      if (registration.success) {
          // 3. SI HAY HISTORIAL, RE-APLICARLO
          if (registration.actions && registration.actions.length > 0) {
              const res = transform.applyBatchTransform(finalData, rawKeys, registration.actions);
              updateDataState(res.data, res.columns);
              showToast(existingFileId ? 'Automatización restaurada correctamente.' : 'Transformaciones históricas aplicadas automáticamente.', 'success');
          } else {
              // 4. SI NO HAY HISTORIAL, BUSCAR AUTOMATIZACIONES (REGLAS)
              const autoActions = checkAutomationRules({ filename: fName }, rawKeys);
              if (autoActions.length > 0) {
                  const res = transform.applyBatchTransform(finalData, rawKeys, autoActions);
                  updateDataState(res.data, res.columns);
              }
          }

          setTempWorkbook(null);
          setAvailableSources([]);
          setShowSourceModal(false);
          setDuplicateModal({ isOpen: false, existingFile: null, newData: null, fName: '', fSize: '' });
          setLoading(false);
      } else {
          setLoading(false);
          // Si falla, cerramos el modal también para no bloquear, el toast ya mostró el error
          setDuplicateModal({ isOpen: false, existingFile: null, newData: null, fName: '', fSize: '' });
      }
  };

  const handleDuplicateDecision = (decision) => {
      const { existingFile, newData, fName, fSize } = duplicateModal;
      if (decision === 'update') {
          // Actualizar existente (Sin consumo de crédito extra)
          finalizeRegistration(newData, fName, fSize, existingFile.id);
      } else if (decision === 'copy') {
          // Crear copia (Renombrar y consumir crédito)
          // registerFile en DataContext ya maneja el renombrado automático si existe
          finalizeRegistration(newData, fName, fSize, null); 
      } else {
          // Cancelar
          setDuplicateModal({ isOpen: false, existingFile: null, newData: null, fName: '', fSize: '' });
          if(fileInputRef.current) fileInputRef.current.value = "";
      }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isReupload = cloudFiles.some(f => f.filename === file.name);
    if (!isReupload && !canUploadNew) {
        showToast(`🛑 Límite alcanzado.`, 'error');
        e.target.value = null;
        return;
    }

    setLoading(true);
    setError(null);
    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    
    if (file.name.endsWith('.csv')) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data, file.name, sizeStr),
        error: (err) => { setError('Error CSV: ' + err.message); setLoading(false); }
      });
      return;
    } 
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setTempFileName(file.name);
      setTempFileSize(sizeStr);
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const sources = [];
          
          wb.SheetNames.forEach(sheetName => {
              sources.push({ id: `sheet-${sheetName}`, name: sheetName, type: 'sheet', description: 'Hoja Completa' });
              const ws = wb.Sheets[sheetName];
              const detectedBlocks = detectDataBlocks(ws, sheetName);
              detectedBlocks.forEach(block => sources.push(block));
          });
          
          if (wb.Workbook && wb.Workbook.Names) {
              wb.Workbook.Names.forEach((definedName, idx) => {
                  const name = definedName.Name;
                  if (name && !name.startsWith('_') && !name.includes('Print_Area')) {
                      sources.push({ id: `table-${idx}`, name: name, type: 'table', ref: definedName.Ref, description: 'Tabla Definida' });
                  }
              });
          }
          setTempWorkbook(wb);
          setAvailableSources(sources);
          setShowSourceModal(true);
          setLoading(false);
        } catch (err) { setError('Error Excel: ' + err.message); setLoading(false); }
      };
    } else { setError('Formato inválido.'); setLoading(false); }
  };

  const handleSourceSelect = (source) => {
      if (loading) return; 
      setLoading(true);
      setTimeout(() => {
          try {
              let ws = null, range = null, rawData = [];
              if (source.type === 'sheet') {
                  ws = tempWorkbook.Sheets[source.name];
                  rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
              } else {
                  let sheetName = "";
                  if (source.type === 'auto-table') { sheetName = source.sheet; range = source.ref; }
                  else {
                      const fullRef = source.ref; const splitIdx = fullRef.lastIndexOf('!');
                      if (splitIdx !== -1) { sheetName = fullRef.substring(0, splitIdx).replace(/^'|'$/g, ''); range = fullRef.substring(splitIdx + 1); }
                      else { sheetName = tempWorkbook.SheetNames[0]; range = fullRef; }
                  }
                  ws = tempWorkbook.Sheets[sheetName]; if (!ws) throw new Error("Hoja no encontrada");
                  rawData = XLSX.utils.sheet_to_json(ws, { range: range, header: 1, defval: null });
              }
              const cleanMatrix = normalizeMatrix(rawData);
              if (!cleanMatrix || cleanMatrix.length < 2) throw new Error("Datos insuficientes en la selección.");
              
              const headers = cleanMatrix[0];
              const body = cleanMatrix.slice(1);
              const finalHeaders = headers.map((h, idx) => (h && String(h).trim() !== '') ? String(h).trim() : `Col_${idx + 1}`);
              const json = body.map(row => {
                  const obj = {}; let hasData = false;
                  finalHeaders.forEach((header, idx) => { const val = row[idx]; if (val !== null && val !== undefined && String(val).trim() !== "") hasData = true; obj[header] = (val !== undefined) ? val : null; });
                  return hasData ? obj : null;
              }).filter(r => r !== null);

              processData(json, `${tempFileName} [${source.name}]`, tempFileSize);
          } catch (err) { setError("Error al procesar: " + err.message); setLoading(false); }
      }, 50);
  };

  const cancelImport = () => { setShowSourceModal(false); setTempWorkbook(null); setAvailableSources([]); setLoading(false); if(fileInputRef.current) fileInputRef.current.value = ""; };
  const clearView = () => { resetWorkspace(); if(fileInputRef.current) fileInputRef.current.value = ""; };
  
  const triggerReload = (filename) => {
      showToast(`Cargando: ${filename}`, 'info');
      if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDeleteFile = (id, e) => {
      e.stopPropagation();
      setConfirmModal({
          isOpen: true,
          fileId: id,
          title: 'Advertencia',
          message: 'Al eliminar este archivo, no recuperarás el crédito utilizado y todas las automatizaciones asociadas se perderán permanentemente. ¿Deseas continuar?'
      });
  };

  const confirmDelete = async () => {
      if (confirmModal.fileId) {
          await deleteFile(confirmModal.fileId);
          setConfirmModal({ isOpen: false, fileId: null, title: '', message: '' });
      }
  };

  const handleUploadClick = () => {
      // 1. Verificación estricta de límite total
      if (!canUploadNew && !cloudFiles.length) {
          // Caso extremo: estado inconsistente
          setAlertModal({
              isOpen: true,
              title: 'Límite alcanzado',
              message: 'Has utilizado tus 3 créditos disponibles. Por favor, vacía tu papelera.'
          });
          return;
      }
      if (!canUploadNew) {
           setAlertModal({
              isOpen: true,
              title: 'Límite alcanzado',
              message: 'Debes eliminar permanentemente archivos de la papelera para recuperar créditos. El límite incluye archivos eliminados temporalmente.'
          });
          return;
      }
      fileInputRef.current.click();
  };

  const adRefRight = useRef(null);
  useEffect(() => {
    const container = adRefRight.current;
    if (!container) return;
    container.innerHTML = '';
    const opt = document.createElement('script');
    opt.type = 'text/javascript';
    opt.text = `
      atOptions = {
        'key' : 'dff78f4f305680f052395c26a76683ea',
        'format' : 'iframe',
        'height' : 300,
        'width' : 160,
        'params' : {}
      };
    `;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/dff78f4f305680f052395c26a76683ea/invoke.js';
    script.async = true;
    container.appendChild(opt);
    container.appendChild(script);
    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      
      {/* MODAL DE DUPLICADO */}
      {duplicateModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-wolf/20 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('workspace.duplicateFileDetected')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                Ya existe un archivo llamado <span className="font-mono bg-gray-100 dark:bg-white/10 px-1 rounded">{duplicateModal.fName}</span> en tu nube.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => handleDuplicateDecision('update')}
                            className="w-full text-left p-4 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-blue-700 dark:text-blue-400">Actualizar Existente (Recomendado)</span>
                                <span className="text-[10px] bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-white px-2 py-0.5 rounded-full font-bold">Sin Costo</span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-300 opacity-80">
                                Reemplaza los datos pero <b>mantiene tus automatizaciones</b> y no consume créditos adicionales.
                            </p>
                        </button>

                        <button 
                            onClick={() => handleDuplicateDecision('copy')}
                            className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-wolf/20 hover:border-persian/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                        >
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-700 dark:text-zinc">Crear Copia Nueva</span>
                                <span className="text-[10px] bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold">-1 Crédito</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-wolf">
                                Guarda como <code>{duplicateModal.fName.replace('.csv', ' (1).csv')}</code>. Perderás el historial de cambios previo.
                            </p>
                        </button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={() => handleDuplicateDecision('cancel')} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-white font-medium text-sm">Cancelar Subida</button>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN DE PROYECTO */}
      {projectAssignModal.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-wolf/20 overflow-hidden">
                <div className="p-6">
                    <h3 className="font-bold text-lg dark:text-white mb-4">Mover a Proyecto</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar mb-4">
                        <button 
                            onClick={() => { assignFileToProject(projectAssignModal.fileId, null); setProjectAssignModal({ isOpen: false, fileId: null }); }}
                            className="w-full text-left p-3 rounded-lg border border-dashed border-gray-300 dark:border-wolf/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm text-gray-500"
                        >
                            Sin Proyecto (Raíz)
                        </button>
                        {projects.map(p => (
                            <button 
                                key={p.id} 
                                onClick={() => { assignFileToProject(projectAssignModal.fileId, p.id); setProjectAssignModal({ isOpen: false, fileId: null }); }}
                                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-wolf/10 hover:border-persian/50 hover:bg-persian/5 transition-colors flex items-center gap-3"
                            >
                                <Folder size={18} className="text-persian" />
                                <span className="font-medium text-gray-700 dark:text-zinc text-sm">{p.name}</span>
                            </button>
                        ))}
                        {projects.length === 0 && <p className="text-center text-xs text-gray-400 py-2">No hay proyectos creados.</p>}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => setProjectAssignModal({ isOpen: false, fileId: null })} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-sm">Cancelar</button>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md border border-red-200 dark:border-red-900/30 overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{confirmModal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{confirmModal.message}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-wolf/20 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                        <button onClick={confirmDelete} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">{t('workspace.deleteFile')}</button>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* MODAL DE ALERTA (LÍMITE) */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-wolf/20 overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{alertModal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{alertModal.message}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setAlertModal({...alertModal, isOpen: false})} className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-wolf/20 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Entendido</button>
                        <button onClick={() => navigate('/billing')} className="px-5 py-2.5 rounded-lg bg-persian hover:bg-sea text-white font-bold shadow-lg shadow-persian/20 transition-all active:scale-95">Mejorar Plan</button>
                    </div>
                </div>
             </div>
        </div>
      )}
      
      {/* --- INPUT DE ARCHIVO GLOBAL (MOVIDO AQUÍ PARA QUE SIEMPRE EXISTA) --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload} 
        accept=".csv,.xlsx,.xls" 
        onClick={(e) => { e.target.value = null }} 
        disabled={!canUploadNew && !cloudFiles.length} 
      />

      {/* MODAL */}
      {showSourceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-wolf/20 flex flex-col overflow-hidden max-h-[85vh]">
                  <div className="p-5 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                      <div><h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Layers size={20} className="text-persian"/> Selecciona Origen</h3></div>
                      <button onClick={cancelImport} disabled={loading}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-gray-100/50 dark:bg-black/20">
                      <div className="space-y-2">
                          {availableSources.map((src) => (
                              <button key={src.id} onClick={() => handleSourceSelect(src)} disabled={loading} className={`w-full text-left p-4 rounded-xl bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 transition-all flex items-center justify-between group relative overflow-hidden ${loading ? 'opacity-50' : 'hover:border-persian hover:bg-persian/5 dark:hover:bg-persian/10'}`}>
                                  <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-lg shadow-sm ${src.type === 'sheet' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                                        {src.type === 'sheet' ? <FileSpreadsheet size={24} /> : <Table size={24} />}
                                      </div>
                                      <div><span className="block font-bold text-gray-800 dark:text-zinc text-sm">{src.name}</span><span className="text-[10px] uppercase font-bold text-gray-400">{src.type === 'sheet' ? 'Hoja' : 'Tabla'}</span></div>
                                  </div>
                                  {!loading && <ArrowRight size={18} className="text-gray-300 group-hover:text-persian opacity-0 group-hover:opacity-100 transition-all"/>}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row gap-4 h-full min-h-0 w-full overflow-hidden">
        {/* PANEL IZQUIERDO */}
        <div className="flex-1 flex flex-col min-w-0 w-full md:w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200 dark:border-wolf/20 flex justify-between items-center bg-white dark:bg-carbon-light shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-zinc flex items-center gap-2">
                    <UploadCloud className="text-persian" size={24}/> Workspace
                    {userTier === 'free' && <span className="text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 font-bold">Free</span>}
                    {userTier === 'pro' && <span className="text-[10px] bg-persian/10 text-persian border border-persian/20 px-2 py-0.5 rounded flex items-center gap-1 font-bold"><Crown size={10}/> Pro</span>}
                    </h2>
                    <p className="text-gray-500 dark:text-wolf text-sm mt-1">{t('workspace.uploadHint')}</p>
                </div>
                {data.length > 0 && (
                    <div className="flex gap-3">
                    <button onClick={clearView} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"><X size={16} /> Cerrar</button>
                    <button onClick={() => navigate('/transform')} className="bg-persian hover:bg-sea text-white px-6 py-2 rounded-lg font-semibold flex items-center shadow-lg shadow-persian/20 transition-all active:scale-95">Transformar <ArrowRight size={18} className="ml-2" /></button>
                    </div>
                )}
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-black/20 relative overflow-hidden flex flex-col">
            {data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center overflow-auto">
                    <div 
                        className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all group ${!canUploadNew && !cloudFiles.length ? 'border-red-300 bg-red-50 dark:bg-red-900/10 cursor-not-allowed' : 'border-gray-300 dark:border-wolf/20 bg-white dark:bg-carbon hover:border-persian/50 cursor-pointer'}`}
                        onClick={handleUploadClick}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform ${!canUploadNew && !cloudFiles.length ? 'bg-red-100 text-red-500' : 'bg-persian/10 text-persian group-hover:scale-110'}`}>
                            {!canUploadNew && !cloudFiles.length ? <Lock size={40}/> : <UploadCloud size={40} />}
                        </div>
                        {!canUploadNew ? (
                            <>
                                <h3 className="text-xl font-bold text-red-500 mb-2">Límite Alcanzado</h3>
                                <p className="text-gray-500 dark:text-wolf mb-4 max-w-xs mx-auto">Has utilizado tus 3 créditos disponibles. Elimina archivos de la papelera permanentemente para liberar espacio.</p>
                                <button onClick={() => setShowTrash(true)} className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl font-bold shadow-sm mb-2">Ver Papelera</button>
                                <button onClick={() => navigate('/billing')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg block w-full max-w-[200px] mx-auto">Mejorar Plan</button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc mb-2">Haz clic o arrastra tu archivo</h3>
                                <p className="text-gray-500 dark:text-wolf mb-8">Soportamos archivos complejos.</p>
                                <button className="bg-persian hover:bg-sea text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : t('workspace.selectFile')}</button>
                            </>
                        )}
                        {/* INPUT ELIMINADO DE AQUÍ PARA QUE NO DESAPAREZCA */}
                    </div>
                    {error && <div className="mt-6 text-red-500 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/20 flex items-center gap-2 animate-in slide-in-from-bottom-2"><AlertCircle size={16}/> {error}</div>}
                </div>
            ) : (
                <div className="flex-1 p-6 flex flex-col min-h-0 overflow-hidden">
                    <div className="bg-white dark:bg-carbon rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm flex flex-col flex-1 overflow-hidden">
                        <div className="bg-gray-100 dark:bg-carbon-light px-4 py-2 border-b border-gray-200 dark:border-wolf/20 flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-wolf shrink-0"><Grid3X3 size={12} /> {t('workspace.previewReadOnly')}</div>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-black/20 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 dark:border-wolf/20 text-xs font-mono text-gray-400 dark:text-wolf w-12 text-center bg-gray-50 dark:bg-[#1a1a1a]">#</th>
                                        {columns.map((col, idx) => (<th key={idx} className="p-3 border-b border-gray-200 dark:border-wolf/20 text-xs font-bold uppercase text-gray-600 dark:text-wolf whitespace-nowrap bg-gray-50 dark:bg-[#1a1a1a]">{col}</th>))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-wolf/5">
                                    {data.slice(0, 100).map((row, i) => (
                                    <tr key={i} className="hover:bg-persian/5 transition-colors">
                                        <td className="p-3 text-xs text-gray-400 font-mono border-r border-gray-100 dark:border-wolf/10 text-center">{i + 1}</td>
                                        {columns.map((col, j) => (<td key={j} className="p-3 text-sm text-gray-700 dark:text-zinc/80 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">{row[col]}</td>))}
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center shrink-0"><div className="bg-persian/10 text-persian px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-persian/20"><CheckCircle2 size={16} /> Mostrando {Math.min(data.length, 100)} de {data.length.toLocaleString()} filas.</div></div>
                </div>
            )}
            </div>
        </div>

        {/* PANEL DERECHO: BIBLIOTECA */}
        <div className="w-full md:w-80 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 rounded-xl shadow-sm flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-wolf/10 bg-gray-50 dark:bg-carbon-light shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-zinc flex items-center gap-2"><HardDrive size={18} className="text-persian"/> {showTrash ? t('workspace.trash') : t('workspace.myFiles')}</h3>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setShowFilters(!showFilters)} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${showFilters ? 'bg-persian/10 text-persian' : 'text-gray-400'}`} title={t('workspace.filtersTooltip')}>
                            <Filter size={16}/>
                         </button>
                        <button onClick={() => setShowTrash(!showTrash)} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${showTrash ? 'text-red-500 bg-red-50 dark:bg-red-900/10' : 'text-gray-400'}`} title={showTrash ? t('workspace.viewFiles') : t('workspace.viewTrash')}>
                            {showTrash ? <ArrowRight size={16}/> : <Trash2 size={16}/>}
                        </button>
                    </div>
                </div>
                
                {/* BUSCADOR */}
                <div className="mt-3 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                        type="text" 
                        placeholder={t('workspace.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-wolf/10 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:border-persian outline-none transition-colors"
                    />
                </div>

                {/* FILTROS EXPANDIBLES (MEJORADOS) */}
                {showFilters && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-wolf/10 animate-in slide-in-from-top-2">
                        <select 
                            value={filterProject} 
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="w-full bg-white dark:bg-[#2d2d2d] border border-gray-300 dark:border-wolf/20 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc outline-none shadow-sm focus:ring-1 focus:ring-persian"
                        >
                            <option value="all" className="bg-white dark:bg-[#2d2d2d] text-gray-800 dark:text-zinc">Todos los Proyectos</option>
                            <option value="none" className="bg-white dark:bg-[#2d2d2d] text-gray-800 dark:text-zinc">Sin Proyecto</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id} className="bg-white dark:bg-[#2d2d2d] text-gray-800 dark:text-zinc">
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="text-gray-500 dark:text-wolf">{t('workspace.creditsUsedLabel')}</span>
                    <span className={`font-bold ${!canUploadNew ? 'text-red-500' : 'text-green-500'}`}>{filesUploadedCount} / {planLimits.maxFiles}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-black/30 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${!canUploadNew ? 'bg-red-500' : 'bg-persian'}`} style={{ width: `${Math.min(100, (filesUploadedCount/planLimits.maxFiles)*100)}%` }}></div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-gray-50/30 dark:bg-black/10">
                {showTrash ? (
                    filteredFiles.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-xs">{searchQuery ? 'No hay resultados en papelera.' : 'Papelera vacía.'}</div>
                    ) : (
                        filteredFiles.map(file => (
                            <div key={file.id} className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20 shadow-sm flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2 mb-1"><FileSpreadsheet size={14} className="text-red-400 shrink-0"/><p className="text-sm font-medium text-gray-700 dark:text-zinc truncate line-through decoration-red-500/50">{file.filename}</p></div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => restoreFile(file.id)} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors" title="Restaurar"><RefreshCw size={14}/></button>
                                    <button onClick={() => permanentDeleteFile(file.id)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors" title="Eliminar Permanentemente"><X size={14}/></button>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    filteredFiles.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-xs">{searchQuery ? 'No se encontraron archivos.' : 'No has subido archivos aún.'}</div>
                    ) : (
                        filteredFiles.map(file => (
                            <div 
                                key={file.id} 
                                onClick={() => triggerReload(file.filename)}
                                className="bg-white dark:bg-carbon-light p-3 rounded-lg border border-gray-200 dark:border-wolf/10 shadow-sm flex items-center justify-between group hover:border-persian/50 hover:bg-persian/5 cursor-pointer transition-all"
                                title="Clic para re-subir (Gratis)"
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileSpreadsheet size={14} className="text-persian shrink-0"/>
                                        <p className="text-sm font-medium text-gray-700 dark:text-zinc truncate" title={file.filename}>{file.filename}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <span>{file.row_count?.toLocaleString()} filas</span>
                                        {file.actions && file.actions.length > 0 && <span className="flex items-center gap-1 text-persian bg-persian/10 px-1.5 py-0.5 rounded border border-persian/20"><Zap size={10} /> Auto</span>}
                                        {file.projectId && <span className="flex items-center gap-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded"><Folder size={10} /> {projects.find(p => p.id === file.projectId)?.name}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setProjectAssignModal({ isOpen: true, fileId: file.id }); }} 
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" 
                                        title="Mover a Proyecto"
                                    >
                                        <Folder size={14}/>
                                    </button>
                                    <button onClick={(e) => handleDeleteFile(file.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Eliminar"><Trash2 size={14}/></button>
                                    <div className="text-persian opacity-0 group-hover:opacity-100 transition-opacity p-1.5"><RefreshCw size={14} /></div>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-wolf/10 bg-gray-50 dark:bg-carbon-light shrink-0">
              <div className="hidden md:flex justify-center">
                <div className="rounded-xl border border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light p-2 shadow-sm">
                  <div ref={adRefRight} style={{ width: 160, height: 300 }} className="flex items-center justify-center" />
                </div>
              </div>
            </div>
            
            {userTier === 'free' && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-900/20 text-center shrink-0">
                    <div className="flex items-center justify-center gap-2 mb-2"><AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-500"/><p className="text-xs font-bold text-yellow-700 dark:text-yellow-500">¿Te quedaste sin subidas?</p></div>
                    <button onClick={() => navigate('/billing')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-2 rounded-lg shadow-sm transition-colors">Actualizar a PRO</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
