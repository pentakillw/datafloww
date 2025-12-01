import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
  Filter, Trash2, ArrowDownAZ, Eraser, 
  Type, Undo2, History, XCircle, Search,
  Calculator, Sigma, Edit3, Replace, Scissors,
  ArrowUp, TableProperties, ArrowLeftRight, ChevronDown, Sparkles,
  Calendar, GitFork, Divide, LayoutList,
  Combine, Split, Baseline, ListOrdered, Hash, Ruler, CaseUpper, FunctionSquare,
  Code, Clock, RefreshCcw, Binary, SigmaSquare, CalendarPlus, Percent, AlignLeft, CalendarRange, Flag,
  Globe, BarChart4, ArrowRightLeft, ArrowDownToLine, EyeOff, Scaling, WrapText,
  Copy, Shuffle, CheckSquare, FileDigit, CalendarDays, Link2, Dices, FileCode2,
  DollarSign, ArrowRightToLine, Lock, Braces, Info, Minimize2, Maximize2, X
} from 'lucide-react';

export default function TransformationStudio() {
  const { data, setData, columns, setColumns, logAction, actions, undoLastAction, showToast } = useData();
  const [activeCol, setActiveCol] = useState(null);
  
  // --- ESTADOS DE LA INTERFAZ (ZEN MODE) ---
  const [historyOpen, setHistoryOpen] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Estado para Menús Desplegables
  const [openMenu, setOpenMenu] = useState(null); 
  const menuRef = useRef(null);

  // Modales
  const [activeModal, setActiveModal] = useState(null); 

  // --- ESTADOS PARA INPUTS Y CONFIGURACIÓN ---
  const [filterValue, setFilterValue] = useState('');
  const [filterType, setFilterType] = useState('contains');
  
  // Matemáticas
  const [mathTarget, setMathTarget] = useState('Total');
  const [mathOp, setMathOp] = useState('*');
  const [mathCol2, setMathCol2] = useState(columns[0] || '');
  
  // Agrupación
  const [groupAggCol, setGroupAggCol] = useState(columns[0] || '');
  const [groupOp, setGroupOp] = useState('SUM');
  
  // Texto
  const [newName, setNewName] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  // Relleno
  const [fillValue, setFillValue] = useState('0');
  const [rowsToRemove, setRowsToRemove] = useState(1);
  const [targetType, setTargetType] = useState('numeric');
  
  // Lógica
  const [condTarget, setCondTarget] = useState('Status');
  const [condOp, setCondOp] = useState('>');
  const [condVal, setCondVal] = useState('0');
  const [condTrue, setCondTrue] = useState('Alto');
  const [condFalse, setCondFalse] = useState('Bajo');
  
  // Avanzado
  const [mergeCol2, setMergeCol2] = useState('');
  const [mergeSep, setMergeSep] = useState(' '); 
  const [splitDelim, setSplitDelim] = useState(',');
  const [affixText, setAffixText] = useState('');
  const [affixType, setAffixType] = useState('prefix');
  const [regexPattern, setRegexPattern] = useState('[A-Za-z]+'); 
  const [imputeMethod, setImputeMethod] = useState('mean'); 
  const [binSize, setBinSize] = useState('10'); 
  const [subStart, setSubStart] = useState('0');
  const [subLen, setSubLen] = useState('5');
  const [addDaysVal, setAddDaysVal] = useState('30');
  const [compCol2, setCompCol2] = useState('');
  const [compOp, setCompOp] = useState('=');
  const [clipMin, setClipMin] = useState('0');
  const [clipMax, setClipMax] = useState('100');
  const [maskChars, setMaskChars] = useState('4');
  const [padLen, setPadLen] = useState('5');
  const [padChar, setPadChar] = useState('0');
  const [jsonKey, setJsonKey] = useState('');
  const [roundDecimals, setRoundDecimals] = useState('2');
  const [colStats, setColStats] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setFilterValue(''); setNewName(''); setFindText(''); setReplaceText(''); 
  };

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const inferType = (val) => {
    if (val === null || val === undefined || val === '') return 'null';
    if (!isNaN(parseFloat(val)) && isFinite(val)) return 'number';
    if (!isNaN(Date.parse(val)) && String(val).length > 5 && (String(val).includes('-') || String(val).includes('/'))) return 'date';
    return 'text';
  };

  // --- LÓGICA DE TRANSFORMACIÓN ---

  const smartClean = () => {
    let newData = [...data];
    let initialCount = newData.length;
    newData = newData.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => { 
        if (typeof newRow[key] === 'string') newRow[key] = newRow[key].trim();
      });
      return newRow;
    });
    newData = newData.filter(row => {
      const values = Object.values(row);
      const nulls = values.filter(v => v === null || v === '').length;
      return nulls < (values.length / 2);
    });
    const uniqueData = Array.from(new Set(newData.map(JSON.stringify))).map(JSON.parse);
    const removedCount = initialCount - uniqueData.length;
    setData(uniqueData);
    logAction({ type: 'SMART_CLEAN', description: `Auto-limpieza (Trim + Nulos + Duplicados)` });
    showToast(`Limpieza completada. ${removedCount} filas eliminadas.`, 'success');
  };

  const dropColumn = () => { if (!activeCol) return showToast('Selecciona columna', 'warning'); if (columns.length <= 1) return showToast('No puedes borrar todo', 'error'); const newData = data.map(row => { const { [activeCol]: _, ...rest } = row; return rest; }); setColumns(columns.filter(c => c !== activeCol)); setData(newData); setActiveCol(null); logAction({ type: 'DROP_COLUMN', col: activeCol, description: `Eliminar columna '${activeCol}'` }); setOpenMenu(null); };
  const removeDuplicates = () => { const u=Array.from(new Set(data.map(JSON.stringify))).map(JSON.parse); setData(u); logAction({ type: 'DROP_DUPLICATES', description: 'Quitar Duplicados' }); setOpenMenu(null); };
  const dropNulls = () => { setData(data.filter(r => Object.values(r).every(v=>v!==null&&v!==''))); logAction({ type: 'DROP_NULLS', description: 'Quitar Nulos' }); setOpenMenu(null); };
  const fillDown = () => { if (!activeCol) return; let lv = null; const newData = data.map(r => { let cv = r[activeCol]; if (cv!=null && cv!=='' && cv!==undefined) lv = cv; else cv = lv; return { ...r, [activeCol]: cv }; }); setData(newData); logAction({ type: 'FILL_DOWN', col: activeCol, description: `Rellenar hacia abajo` }); setOpenMenu(null); };
  const cleanSymbols = () => { if (!activeCol) return; const nd = data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').replace(/[^a-zA-Z0-9\s]/g, '') })); setData(nd); logAction({ type: 'CLEAN_SYMBOLS', col: activeCol, description: `Limpiar Símbolos` }); setOpenMenu(null); };
  
  const imputeNulls = () => { if (!activeCol) return; const values = data.map(r => r[activeCol]).filter(v => v !== null && v !== '' && !isNaN(v)).map(v => parseFloat(v)); let replacement = 0; if (values.length === 0) return; if (imputeMethod === 'mean') replacement = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2); else if (imputeMethod === 'median') { values.sort((a, b) => a - b); const mid = Math.floor(values.length / 2); replacement = values.length % 2 !== 0 ? values[mid] : ((values[mid - 1] + values[mid]) / 2).toFixed(2); } else if (imputeMethod === 'mode') { const allValues = data.map(r => r[activeCol]).filter(v => v !== null && v !== ''); const counts = {}; allValues.forEach(v => counts[v] = (counts[v] || 0) + 1); replacement = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b); } const newData = data.map(row => ({ ...row, [activeCol]: (row[activeCol] === null || row[activeCol] === '') ? replacement : row[activeCol] })); setData(newData); logAction({ type: 'IMPUTE', col: activeCol, method: imputeMethod, val: replacement, description: `Imputar nulos con ${imputeMethod}` }); closeModal(); };
  const extractJson = () => { if (!activeCol) return; const newCol = `${activeCol}_${jsonKey}`; const newData = data.map(row => { try { const val = row[activeCol]; const obj = typeof val === 'string' ? JSON.parse(val) : val; return { ...row, [newCol]: obj?.[jsonKey] || '' }; } catch (e) { return { ...row, [newCol]: '' }; } }); setColumns([...columns, newCol]); setData(newData); logAction({ type: 'JSON_EXTRACT', col: activeCol, key: jsonKey, description: `Extraer JSON Key '${jsonKey}'` }); closeModal(); };
  const applyRound = () => { if (!activeCol) return; const dec = parseInt(roundDecimals) || 0; const newData = data.map(row => ({ ...row, [activeCol]: !isNaN(parseFloat(row[activeCol])) ? parseFloat(row[activeCol]).toFixed(dec) : row[activeCol] })); setData(newData); logAction({ type: 'ROUND', col: activeCol, decimals: dec, description: `Redondear a ${dec} decimales` }); closeModal(); };
  const applyPadStart = () => { if (!activeCol) return; const len = parseInt(padLen)||5; const char = padChar.charAt(0)||'0'; const newData = data.map(row => ({ ...row, [activeCol]: String(row[activeCol]||'').padStart(len, char) })); setData(newData); logAction({ type: 'PAD_START', col: activeCol, len, char, description: `Rellenar ceros` }); closeModal(); };
  const maskData = () => { if (!activeCol) return; const v = parseInt(maskChars)||4; const newData = data.map(r => { const val = String(r[activeCol]||''); const vp = val.slice(-v); const mp = '*'.repeat(Math.max(0, val.length - v)); return { ...r, [activeCol]: mp + vp }; }); setData(newData); logAction({ type: 'MASK', col: activeCol, visible: v, description: `Enmascarar` }); closeModal(); };
  const encodeBase64 = () => { if (!activeCol) return; const newData = data.map(row => ({ ...row, [activeCol]: btoa(String(row[activeCol]||'')) })); setData(newData); logAction({ type: 'BASE64', col: activeCol, description: `Codificar Base64` }); setOpenMenu(null); };
  const calcZScore = () => { if (!activeCol) return; const values = data.map(r => parseFloat(r[activeCol])).filter(n => !isNaN(n)); if (!values.length) return; const mean = values.reduce((a, b) => a + b, 0) / values.length; const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length; const std = Math.sqrt(variance); const newCol = `${activeCol}_Z`; const newData = data.map(r => { const v = parseFloat(r[activeCol]); return { ...r, [newCol]: (!isNaN(v) && std!==0) ? ((v - mean) / std).toFixed(4) : null }; }); setColumns([...columns, newCol]); setData(newData); logAction({ type: 'Z_SCORE', col: activeCol, description: `Z-Score` }); setOpenMenu(null); };
  const clipValues = () => { if (!activeCol) return; const min = parseFloat(clipMin); const max = parseFloat(clipMax); const newData = data.map(r => { let v = parseFloat(r[activeCol]); if (!isNaN(v)) { v = Math.min(Math.max(v, min), max); } return { ...r, [activeCol]: v }; }); setData(newData); logAction({ type: 'CLIP', col: activeCol, min, max, description: `Clip [${min}, ${max}]` }); closeModal(); };
  const formatCurrency = () => { if (!activeCol) return; const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }); const newData = data.map(row => { const v = parseFloat(row[activeCol]); return { ...row, [activeCol]: !isNaN(v) ? f.format(v) : row[activeCol] }; }); setData(newData); logAction({ type: 'FMT_CURRENCY', col: activeCol, description: `Moneda` }); setOpenMenu(null); };

  const extractInitials = () => { if (!activeCol) return; const nc = `${activeCol}_Initials`; const nd = data.map(r => { const v = String(r[activeCol]||''); const i = v.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join(''); return { ...r, [nc]: i }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'INITIALS', col: activeCol, description: `Iniciales` }); setOpenMenu(null); };
  const duplicateCol = () => { if (!activeCol) return; const nc = `${activeCol}_Copy`; const nd = data.map(r => ({ ...r, [nc]: r[activeCol] })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'DUPLICATE', col: activeCol, description: `Duplicar` }); setOpenMenu(null); };
  const extractNumbers = () => { if (!activeCol) return; const nc = `${activeCol}_Num`; const nd = data.map(r => ({ ...r, [nc]: String(r[activeCol]||'').replace(/\D/g, '') })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'EXTRACT_NUM', col: activeCol, description: `Solo Números` }); setOpenMenu(null); };
  const shuffleData = () => { const nd = [...data].sort(() => Math.random() - 0.5); setData(nd); logAction({ type: 'SHUFFLE', description: `Shuffle` }); setOpenMenu(null); };
  const validateEmails = () => { if (!activeCol) return; const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; const nc = `${activeCol}_Valid`; const nd = data.map(r => ({ ...r, [nc]: re.test(String(r[activeCol])) })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'VALIDATE_EMAIL', col: activeCol, description: `Validar Email` }); setOpenMenu(null); };
  const slugifyText = () => { if (!activeCol) return; const nd = data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') })); setData(nd); logAction({ type: 'SLUGIFY', col: activeCol, description: `Slugify` }); setOpenMenu(null); };
  const removeHTML = () => { if (!activeCol) return; const nd = data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').replace(/<[^>]*>?/gm, '') })); setData(nd); logAction({ type: 'REMOVE_HTML', col: activeCol, description: `Quitar HTML` }); setOpenMenu(null); };
  const dateToMonthBoundary = (b) => { if (!activeCol) return; const s = b==='start'?'_StartMonth':'_EndMonth'; const nc = activeCol+s; const nd = data.map(r => { const d = new Date(r[activeCol]); let res = null; if (!isNaN(d.getTime())) { if(b==='start') d.setDate(1); else { d.setMonth(d.getMonth()+1); d.setDate(0); } res = d.toISOString().split('T')[0]; } return { ...r, [nc]: res }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'DATE_BOUNDARY', col: activeCol, mode: b, description: `Límite Mes` }); setOpenMenu(null); };
  const addRandomCol = () => { const nc = 'Random_Val'; const nd = data.map(r => ({ ...r, [nc]: Math.random().toFixed(4) })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'RANDOM', description: `Random Col` }); setOpenMenu(null); };
  const removeAccents = () => { if (!activeCol) return; const nd = data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').normalize("NFD").replace(/[\u0300-\u036f]/g, "") })); setData(nd); logAction({ type: 'REMOVE_ACCENTS', col: activeCol, description: `Quitar Tildes` }); setOpenMenu(null); };
  const minMaxScaling = () => { if (!activeCol) return; const vals = data.map(r => parseFloat(r[activeCol])).filter(n => !isNaN(n)); if (!vals.length) return; const min = Math.min(...vals), max = Math.max(...vals), range = max - min; if (range===0) return; const nc = `${activeCol}_Norm`; const nd = data.map(r => ({ ...r, [nc]: !isNaN(parseFloat(r[activeCol])) ? ((parseFloat(r[activeCol]) - min) / range).toFixed(4) : null })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'MIN_MAX', col: activeCol, description: `Normalizar` }); setOpenMenu(null); };
  const extractDomain = () => { if (!activeCol) return; const nc = `${activeCol}_Domain`; const nd = data.map(r => { const v = String(r[activeCol]||''); const p = v.split('@'); return { ...r, [nc]: p.length > 1 ? p[1] : '' }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'EXTRACT_DOMAIN', col: activeCol, description: `Dominio` }); setOpenMenu(null); };
  const compareColumns = () => { if (!activeCol || !compCol2) return; const nc = `${activeCol}_vs_${compCol2}`; const nd = data.map(r => { const v1 = r[activeCol], v2 = r[compCol2]; let res = false; if (compOp === '=') res = v1 == v2; if (compOp === '!=') res = v1 != v2; return { ...r, [nc]: res }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'COMPARE', col: activeCol, col2: compCol2, op: compOp, description: `Comparar` }); closeModal(); };
  const calcPercent = () => { if (!activeCol) return; const t = data.reduce((a, r) => a + (parseFloat(r[activeCol])||0), 0); const nc = `${activeCol}_%`; const nd = data.map(r => ({ ...r, [nc]: t!==0 ? ((parseFloat(r[activeCol])||0)/t*100).toFixed(2) : 0 })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'PERCENT', col: activeCol, description: `% Total` }); setOpenMenu(null); };
  const countWords = () => { if (!activeCol) return; const nc = `${activeCol}_Words`; const nd = data.map(r => ({ ...r, [nc]: String(r[activeCol]||'').trim().split(/\s+/).filter(w => w.length > 0).length })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'WORD_COUNT', col: activeCol, description: `Contar Palabras` }); setOpenMenu(null); };
  const flagNulls = () => { if (!activeCol) return; const nc = `${activeCol}_IsNull`; const nd = data.map(r => ({ ...r, [nc]: (r[activeCol]==null || r[activeCol]==='' || r[activeCol]===undefined) })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'FLAG_NULLS', col: activeCol, description: `Flag Nulos` }); setOpenMenu(null); };
  const textSubstring = () => { if (!activeCol) return; const s = parseInt(subStart)||0; const l = parseInt(subLen)||5; const nc = `${activeCol}_Sub`; const nd = data.map(r => ({ ...r, [nc]: String(r[activeCol]||'').substr(s, l) })); setColumns([...columns, nc]); setData(nd); logAction({ type: 'SUBSTRING', col: activeCol, start: s, len: l, description: `Subcadena` }); closeModal(); };
  const addDaysToDate = () => { if (!activeCol) return; const d = parseInt(addDaysVal)||0; const nd = data.map(r => { const dt = new Date(r[activeCol]); let res = r[activeCol]; if (!isNaN(dt.getTime())) { dt.setDate(dt.getDate() + d); res = dt.toISOString().split('T')[0]; } return { ...r, [activeCol]: res }; }); setData(nd); logAction({ type: 'ADD_DAYS', col: activeCol, val: d, description: `Sumar Días` }); closeModal(); };
  const applyRegexExtract = () => { if (!activeCol) return; try { const re = new RegExp(regexPattern); const nc = `${activeCol}_Regex`; const nd = data.map(r => { const v = String(r[activeCol]||''); const m = v.match(re); return { ...r, [nc]: m ? m[0] : '' }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'REGEX', col: activeCol, pattern: regexPattern, description: `Regex` }); closeModal(); } catch (e) { showToast('Regex inválida', 'error'); } };
  const daysSince = () => { if (!activeCol) return; const nc = `${activeCol}_Days`; const now = new Date(); const nd = data.map(r => { const d = new Date(r[activeCol]); let v = null; if (!isNaN(d.getTime())) { const diff = Math.abs(now - d); v = Math.ceil(diff / (1000 * 60 * 60 * 24)); } return { ...r, [nc]: v }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'DAYS_SINCE', col: activeCol, description: `Antigüedad` }); setOpenMenu(null); };
  const mathLog = () => { if (!activeCol) return; const nc = `${activeCol}_Log`; const nd = data.map(r => { const v = parseFloat(r[activeCol]); return { ...r, [nc]: v > 0 ? Math.log(v).toFixed(4) : null }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'LOG', col: activeCol, description: `Log(n)` }); setOpenMenu(null); };
  const mathAbs = () => { if (!activeCol) return; const nd = data.map(r => ({ ...r, [activeCol]: Math.abs(parseFloat(r[activeCol])||0) })); setData(nd); logAction({ type: 'ABS', col: activeCol, description: `Absoluto` }); setOpenMenu(null); };
  const textTitleCase = () => { if (!activeCol) return; setData(data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').toLowerCase().replace(/(?:^|\s)\w/g, m => m.toUpperCase()) }))); logAction({ type: 'TITLE_CASE', col: activeCol, description: `Title Case` }); setOpenMenu(null); };
  const textLength = () => { if (!activeCol) return; const nc = `${activeCol}_Len`; setColumns([...columns, nc]); setData(data.map(r => ({ ...r, [nc]: String(r[activeCol]||'').length }))); logAction({ type: 'TEXT_LEN', col: activeCol, description: `Longitud` }); setOpenMenu(null); };
  const addIndexColumn = () => { const nc = 'Index_ID'; setColumns([nc, ...columns]); setData(data.map((r, i) => ({ [nc]: i + 1, ...r }))); logAction({ type: 'ADD_INDEX', description: `Índice` }); setOpenMenu(null); };
  const createBinning = () => { if (!activeCol) return; const s = parseFloat(binSize)||10; const nc = `${activeCol}_Bin`; const nd = data.map(r => { const v = parseFloat(r[activeCol])||0; const l = Math.floor(v / s) * s; return { ...r, [nc]: `${l}-${l + s}` }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'BINNING', col: activeCol, size: s, description: `Binning` }); closeModal(); };
  const mathPower = () => { if (!activeCol) return; const nc = `${activeCol}_Pow2`; setColumns([...columns, nc]); setData(data.map(r => ({ ...r, [nc]: Math.pow(parseFloat(r[activeCol])||0, 2) }))); logAction({ type: 'POW', col: activeCol, description: `Potencia` }); setOpenMenu(null); };
  const mathSqrt = () => { if (!activeCol) return; const nc = `${activeCol}_Sqrt`; setColumns([...columns, nc]); setData(data.map(r => ({ ...r, [nc]: Math.sqrt(Math.abs(parseFloat(r[activeCol])||0)).toFixed(2) }))); logAction({ type: 'SQRT', col: activeCol, description: `Raíz` }); setOpenMenu(null); };
  const mergeColumns = () => { if (!activeCol || !mergeCol2) return; const nc = `${activeCol}_${mergeCol2}`; setColumns([...columns, nc]); setData(data.map(r => ({ ...r, [nc]: `${r[activeCol]||''}${mergeSep}${r[mergeCol2]||''}` }))); logAction({ type: 'MERGE_COLS', col1: activeCol, col2: mergeCol2, sep: mergeSep, description: `Unir Cols` }); closeModal(); };
  const splitColumn = () => { if (!activeCol) return; setColumns([...columns, `${activeCol}_1`, `${activeCol}_2`]); setData(data.map(r => { const v=String(r[activeCol]||''); const p=v.split(splitDelim); return { ...r, [`${activeCol}_1`]: p[0]||'', [`${activeCol}_2`]: p.slice(1).join(splitDelim)||'' }; })); logAction({ type: 'SPLIT_COL', col: activeCol, delim: splitDelim, description: `Dividir` }); closeModal(); };
  const addAffix = () => { if (!activeCol) return; setData(data.map(r => ({ ...r, [activeCol]: affixType==='prefix' ? `${affixText}${r[activeCol]}` : `${r[activeCol]}${affixText}` }))); logAction({ type: 'AFFIX', col: activeCol, text: affixText, mode: affixType, description: `Affix` }); closeModal(); };
  const cumulativeSum = () => { if (!activeCol) return; let s=0; const nc=`${activeCol}_Cum`; setColumns([...columns, nc]); setData(data.map(r => { s+=parseFloat(r[activeCol])||0; return { ...r, [nc]: s.toFixed(2) }; })); logAction({ type: 'CUM_SUM', col: activeCol, description: `Suma Acum.` }); setOpenMenu(null); };
  const addRanking = () => { if (!activeCol) return; const si=[...data].map((r, i) => ({ v: parseFloat(r[activeCol])||0, i })).sort((a, b) => b.v - a.v); const rk={}; si.forEach((x, r) => rk[x.i] = r+1); const nc=`${activeCol}_Rank`; setColumns([...columns, nc]); setData(data.map((r, i) => ({ ...r, [nc]: rk[i] }))); logAction({ type: 'RANK', col: activeCol, description: `Ranking` }); setOpenMenu(null); };
  const extractDatePart = (part) => { if (!activeCol) return; const s = part==='year'?'_Y':part==='month'?'_M':part==='quarter'?'_Q':part==='day'?'_D':'_W'; const nc = activeCol+s; const nd = data.map(r => { const d=new Date(r[activeCol]); let res=null; if(!isNaN(d.getTime())) { if(part==='year') res=d.getFullYear(); if(part==='month') res=d.getMonth()+1; if(part==='quarter') res=Math.ceil((d.getMonth()+1)/3); if(part==='day') res=d.getDate(); if(part==='weekday') res=d.toLocaleDateString('es',{weekday:'long'}); } return { ...r, [nc]: res }; }); setColumns([...columns, nc]); setData(nd); logAction({ type: 'EXTRACT_DATE', col: activeCol, part, description: `Extraer ${part}` }); setOpenMenu(null); };
  const applyConditional = () => { if (!activeCol) return; const nc = condTarget; if (!columns.includes(nc)) setColumns([...columns, nc]); setData(data.map(r => { const v=parseFloat(r[activeCol])||0; const t=parseFloat(condVal)||0; let res=false; if(condOp==='>') res=v>t; if(condOp==='<') res=v<t; if(condOp==='=') res=v===t; return { ...r, [nc]: res ? condTrue : condFalse }; })); logAction({ type: 'CONDITIONAL', col: activeCol, target: condTarget, op: condOp, val: condVal, trueVal: condTrue, falseVal: condFalse, description: `Condicional` }); closeModal(); };
  const removeTopRows = () => { const n=parseInt(rowsToRemove); if(isNaN(n)||n<1) return; setData(data.slice(n)); logAction({ type: 'DROP_TOP_ROWS', count: n, description: `Borrar Filas` }); closeModal(); };
  const promoteHeaders = () => { if(data.length<2) return; const h=columns.map(c=>data[0][c]?String(data[0][c]).trim():c); const u=[]; h.forEach(x=>{let n=x,c=1; while(u.includes(n)) n=`${x}_${c++}`; u.push(n);}); setColumns(u); setData(data.slice(1).map(r=>{const nr={}; columns.forEach((old,i)=>nr[u[i]]=r[old]); return nr;})); logAction({ type: 'PROMOTE_HEADER', description: 'Headers' }); setOpenMenu(null); };
  const changeType = () => { setData(data.map(r => { let v=r[activeCol]; if(targetType==='numeric') { v=parseFloat(v); if(isNaN(v)) v=null; } else if(targetType==='string') v=String(v); else if(targetType==='date') { const d=new Date(v); v=isNaN(d)?v:d.toISOString().split('T')[0]; } return { ...r, [activeCol]: v }; })); logAction({ type: 'CHANGE_TYPE', col: activeCol, newType: targetType, description: `Cambiar Tipo` }); closeModal(); };
  const fillNulls = () => { setData(data.map(r => ({ ...r, [activeCol]: (r[activeCol]==null||r[activeCol]==='')?fillValue:r[activeCol] }))); logAction({ type: 'FILL_NULLS', col: activeCol, val: fillValue, description: `Rellenar Nulos` }); closeModal(); };
  const toUpperCase = () => { setData(data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').toUpperCase() }))); logAction({ type: 'UPPERCASE', col: activeCol, description: 'Mayús' }); setOpenMenu(null); };
  const toLowerCase = () => { setData(data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').toLowerCase() }))); logAction({ type: 'LOWERCASE', col: activeCol, description: 'Minús' }); setOpenMenu(null); };
  const trimText = () => { setData(data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').trim() }))); logAction({ type: 'TRIM', col: activeCol, description: 'Trim' }); setOpenMenu(null); };
  const replaceValues = () => { setData(data.map(r => ({ ...r, [activeCol]: String(r[activeCol]||'').replaceAll(findText, replaceText) }))); logAction({ type: 'REPLACE', col: activeCol, find: findText, replace: replaceText, description: 'Reemplazar' }); closeModal(); };
  const sortAsc = () => { setData([...data].sort((a,b)=>(a[activeCol]>b[activeCol]?1:-1))); logAction({ type: 'SORT_ASC', col: activeCol, description: 'Ordenar' }); setOpenMenu(null); };
  const renameColumn = () => { const nc=data.map(r=>{const nr={...r}; nr[newName]=nr[activeCol]; delete nr[activeCol]; return nr;}); setColumns(columns.map(c=>c===activeCol?newName:c)); setData(nc); setActiveCol(newName); logAction({ type: 'RENAME', col: activeCol, newVal: newName, description: 'Renombrar' }); closeModal(); };
  const applyFilter = () => { let d=[]; if(filterType==='contains') d=data.filter(r=>String(r[activeCol]).includes(filterValue)); if(filterType==='equals') d=data.filter(r=>r[activeCol]==filterValue); if(filterType==='greater') d=data.filter(r=>parseFloat(r[activeCol])>parseFloat(filterValue)); setData(d); logAction({ type: 'FILTER', col: activeCol, op: filterType, val: filterValue, description: 'Filtrar' }); closeModal(); };
  const applyMath = () => { const nc=data.map(r=>{ const v1=parseFloat(r[activeCol])||0, v2=parseFloat(r[mathCol2])||0; let res=0; if(mathOp==='+') res=v1+v2; if(mathOp==='-') res=v1-v2; if(mathOp==='*') res=v1*v2; if(mathOp==='/') res=v2!==0?v1/v2:0; return { ...r, [mathTarget]: res.toFixed(2) }; }); setData(nc); if(!columns.includes(mathTarget)) setColumns([...columns, mathTarget]); logAction({ type: 'CALC_MATH', target: mathTarget, col1: activeCol, col2: mathCol2, op: mathOp, description: 'Cálculo' }); closeModal(); };
  const applyGroup = () => { const g={}; data.forEach(r=>{const k=r[activeCol]||'Other'; if(!g[k]) g[k]=[]; g[k].push(parseFloat(r[groupAggCol])||0);}); const nd=Object.keys(g).map(k=>{const v=g[k]; let r=0; if(groupOp==='SUM') r=v.reduce((a,b)=>a+b,0); if(groupOp==='AVG') r=v.reduce((a,b)=>a+b,0)/v.length; return {[activeCol]:k, [`${groupOp}_${groupAggCol}`]:r.toFixed(2)};}); setData(nd); setColumns([activeCol, `${groupOp}_${groupAggCol}`]); logAction({ type: 'GROUP_BY', col: activeCol, op: groupOp, aggCol: groupAggCol, description: 'Agrupar' }); closeModal(); };
  
  const showColumnStats = () => {
    if (!activeCol) return showToast('Selecciona una columna', 'warning');
    const vals = data.map(r => r[activeCol]);
    const numVals = vals.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const notNulls = vals.filter(v => v !== null && v !== '');
    
    setColStats({
      total: vals.length, filled: notNulls.length, empty: vals.length - notNulls.length, unique: new Set(vals).size,
      type: inferType(notNulls[0]), min: numVals.length ? Math.min(...numVals) : '-', max: numVals.length ? Math.max(...numVals) : '-',
      avg: numVals.length ? (numVals.reduce((a,b)=>a+b,0)/numVals.length).toFixed(2) : '-'
    });
    setActiveModal('stats'); setOpenMenu(null);
  };

  if (columns.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-wolf opacity-60">
      <LayoutList size={64} />
      <h2 className="mt-4 text-xl font-bold">Sin datos cargados</h2>
      <p className="text-sm">Ve a la pestaña "Datos" para comenzar.</p>
    </div>
  );

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      
      {/* ----------------- TARJETA PRINCIPAL (Datos) ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm h-full"> 
      {/* SE ELIMINÓ overflow-hidden de aquí */}
        
        {/* --- MENU BAR --- */}
        <div className="bg-white dark:bg-carbon-light border-b border-gray-200 dark:border-wolf/20 p-2 flex gap-2 items-center relative z-50 flex-wrap shadow-sm rounded-t-xl" ref={menuRef}>
        {/* Se cambió overflow-x-auto a flex-wrap, se aumentó z-index y se añadió redondeo superior */}
          
          <DropdownMenu label="Estructura" icon={<TableProperties size={16} />} isOpen={openMenu === 'structure'} onClick={() => toggleMenu('structure')}>
            <DropdownItem icon={<ArrowUp size={14} />} label="Promover Encabezados" onClick={promoteHeaders} />
            <DropdownItem icon={<ListOrdered size={14} />} label="Agregar Índice" onClick={addIndexColumn} />
            <DropdownItem icon={<Copy size={14} />} label="Duplicar Columna" onClick={duplicateCol} disabled={!activeCol} />
            <DropdownItem icon={<Trash2 size={14} />} label="Eliminar Filas Sup." onClick={() => setActiveModal('dropRows')} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<XCircle size={14} />} label="Eliminar Columna" onClick={dropColumn} disabled={!activeCol} danger />
          </DropdownMenu>

          <DropdownMenu label="Limpieza" icon={<Eraser size={16} />} isOpen={openMenu === 'cleaning'} onClick={() => toggleMenu('cleaning')}>
            <DropdownItem icon={<Trash2 size={14} />} label="Eliminar Duplicados" onClick={removeDuplicates} />
            <DropdownItem icon={<XCircle size={14} />} label="Eliminar Filas Vacías" onClick={dropNulls} />
            <DropdownItem icon={<Binary size={14} />} label="Limpiar Símbolos (A-Z 0-9)" onClick={cleanSymbols} disabled={!activeCol} />
            <DropdownItem icon={<ArrowDownToLine size={14} />} label="Rellenar Abajo (Fill Down)" onClick={fillDown} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<Edit3 size={14} />} label="Rellenar Nulos (Valor)" onClick={() => setActiveModal('fillNulls')} disabled={!activeCol} />
            <DropdownItem icon={<Sigma size={14} />} label="Imputar Nulos (Estadística)" onClick={() => setActiveModal('impute')} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<ArrowLeftRight size={14} />} label="Cambiar Tipo" onClick={() => setActiveModal('changeType')} disabled={!activeCol} />
            <DropdownItem icon={<Edit3 size={14} />} label="Renombrar" onClick={() => { setNewName(activeCol); setActiveModal('rename'); }} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label="Texto" icon={<Type size={16} />} isOpen={openMenu === 'text'} onClick={() => toggleMenu('text')}>
            <DropdownItem icon={<Type size={14} />} label="MAYÚSCULAS" onClick={toUpperCase} disabled={!activeCol} />
            <DropdownItem icon={<Type size={12} />} label="minúsculas" onClick={toLowerCase} disabled={!activeCol} />
            <DropdownItem icon={<CaseUpper size={14} />} label="Nombre Propio (Title)" onClick={textTitleCase} disabled={!activeCol} />
            <DropdownItem icon={<WrapText size={14} />} label="Extraer Iniciales" onClick={extractInitials} disabled={!activeCol} />
            <DropdownItem icon={<FileDigit size={14} />} label="Extraer Solo Números" onClick={extractNumbers} disabled={!activeCol} />
            <DropdownItem icon={<FileCode2 size={14} />} label="Eliminar HTML Tags" onClick={removeHTML} disabled={!activeCol} />
            <DropdownItem icon={<Link2 size={14} />} label="Slugify (URL-Friendly)" onClick={slugifyText} disabled={!activeCol} />
            <DropdownItem icon={<Type size={14} />} label="Eliminar Tildes" onClick={removeAccents} disabled={!activeCol} />
            <DropdownItem icon={<Lock size={14} />} label="Base64 Encode" onClick={encodeBase64} disabled={!activeCol} />
            <DropdownItem icon={<Braces size={14} />} label="Extraer campo JSON..." onClick={() => setActiveModal('json')} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<AlignLeft size={14} />} label="Contar Palabras" onClick={countWords} disabled={!activeCol} />
            <DropdownItem icon={<Code size={14} />} label="Extraer Regex..." onClick={() => setActiveModal('regex')} disabled={!activeCol} />
            <DropdownItem icon={<Globe size={14} />} label="Extraer Dominio (Email)" onClick={extractDomain} disabled={!activeCol} />
            <DropdownItem icon={<ArrowRightToLine size={14} />} label="Rellenar Ceros (Pad Start)..." onClick={() => setActiveModal('pad')} disabled={!activeCol} />
            <DropdownItem icon={<Scissors size={14} />} label="Subcadena (Substring)..." onClick={() => setActiveModal('substring')} disabled={!activeCol} />
            <DropdownItem icon={<Ruler size={14} />} label="Longitud de Texto" onClick={textLength} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<EyeOff size={14} />} label="Enmascarar Datos..." onClick={() => setActiveModal('mask')} disabled={!activeCol} />
            <DropdownItem icon={<Scissors size={14} />} label="Trim Espacios" onClick={trimText} disabled={!activeCol} />
            <DropdownItem icon={<Replace size={14} />} label="Reemplazar..." onClick={() => setActiveModal('replace')} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<Combine size={14} />} label="Concatenar..." onClick={() => setActiveModal('merge')} disabled={!activeCol} />
            <DropdownItem icon={<Split size={14} />} label="Dividir Columna..." onClick={() => setActiveModal('split')} disabled={!activeCol} />
            <DropdownItem icon={<Baseline size={14} />} label="Prefijo/Sufijo..." onClick={() => setActiveModal('affix')} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label="Fechas" icon={<Calendar size={16} />} isOpen={openMenu === 'dates'} onClick={() => toggleMenu('dates')}>
            <DropdownItem icon={<CalendarDays size={14} />} label="Inicio de Mes" onClick={() => dateToMonthBoundary('start')} disabled={!activeCol} />
            <DropdownItem icon={<CalendarDays size={14} />} label="Fin de Mes" onClick={() => dateToMonthBoundary('end')} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<Calendar size={14} />} label="Extraer Año" onClick={() => extractDatePart('year')} disabled={!activeCol} />
            <DropdownItem icon={<CalendarRange size={14} />} label="Extraer Trimestre (Q)" onClick={() => extractDatePart('quarter')} disabled={!activeCol} />
            <DropdownItem icon={<Calendar size={14} />} label="Extraer Mes" onClick={() => extractDatePart('month')} disabled={!activeCol} />
            <DropdownItem icon={<Calendar size={14} />} label="Extraer Día" onClick={() => extractDatePart('day')} disabled={!activeCol} />
            <DropdownItem icon={<Calendar size={14} />} label="Día Semana" onClick={() => extractDatePart('weekday')} disabled={!activeCol} />
            <DropdownItem icon={<Clock size={14} />} label="Extraer Hora" onClick={() => extractTime('hour')} disabled={!activeCol} />
            <DropdownItem icon={<Clock size={14} />} label="Extraer Minutos" onClick={() => extractTime('minute')} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<Clock size={14} />} label="Días desde hoy (Antigüedad)" onClick={daysSince} disabled={!activeCol} />
            <DropdownItem icon={<CalendarPlus size={14} />} label="Sumar Días..." onClick={() => setActiveModal('addDays')} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label="Lógica" icon={<GitFork size={16} />} isOpen={openMenu === 'logic'} onClick={() => toggleMenu('logic')}>
             <DropdownItem icon={<Flag size={14} />} label="Marcar Nulos (True/False)" onClick={flagNulls} disabled={!activeCol} />
             <DropdownItem icon={<CheckSquare size={14} />} label="Validar Formato Email" onClick={validateEmails} disabled={!activeCol} />
             <DropdownItem icon={<GitFork size={14} />} label="Columna Condicional" onClick={() => setActiveModal('conditional')} disabled={!activeCol} />
             <DropdownItem icon={<ArrowRightLeft size={14} />} label="Comparar Columnas" onClick={() => setActiveModal('compare')} disabled={!activeCol} />
             <DropdownItem icon={<FunctionSquare size={14} />} label="Crear Rangos (Binning)" onClick={() => setActiveModal('binning')} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label="Herramientas" icon={<Calculator size={16} />} isOpen={openMenu === 'tools'} onClick={() => toggleMenu('tools')}>
            <DropdownItem icon={<ArrowDownAZ size={14} />} label="Ordenar" onClick={sortAsc} disabled={!activeCol} />
            <DropdownItem icon={<Shuffle size={14} />} label="Orden Aleatorio (Shuffle)" onClick={shuffleData} />
            <DropdownItem icon={<Dices size={14} />} label="Columna Aleatoria (0-1)" onClick={addRandomCol} />
            <DropdownItem icon={<Search size={14} />} label="Filtrar" onClick={() => setActiveModal('filter')} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<Percent size={14} />} label="Porcentaje del Total" onClick={calcPercent} disabled={!activeCol} />
            <DropdownItem icon={<Scaling size={14} />} label="Recortar Rango (Clip)..." onClick={() => setActiveModal('clip')} disabled={!activeCol} />
            <DropdownItem icon={<Calculator size={14} />} label="Cálculo (+-*/)" onClick={() => setActiveModal('math')} disabled={!activeCol} />
            <DropdownItem icon={<SigmaSquare size={14} />} label="Z-Score (Estandarizar)" onClick={calcZScore} disabled={!activeCol} />
            <DropdownItem icon={<BarChart4 size={14} />} label="Normalizar (0-1)" onClick={minMaxScaling} disabled={!activeCol} />
            <DropdownItem icon={<DollarSign size={14} />} label="Formato Moneda" onClick={formatCurrency} disabled={!activeCol} />
            <DropdownItem icon={<Calculator size={14} />} label="Potencia (^2)" onClick={mathPower} disabled={!activeCol} />
            <DropdownItem icon={<Calculator size={14} />} label="Raíz Cuadrada (√)" onClick={mathSqrt} disabled={!activeCol} />
            <DropdownItem icon={<Calculator size={14} />} label="Logaritmo Natural (ln)" onClick={mathLog} disabled={!activeCol} />
            <DropdownItem icon={<RefreshCcw size={14} />} label="Valor Absoluto (|x|)" onClick={mathAbs} disabled={!activeCol} />
            <div className="border-t border-gray-200 dark:border-wolf/10 my-1"></div>
            <DropdownItem icon={<Divide size={14} />} label="Redondear..." onClick={() => setActiveModal('round')} disabled={!activeCol} />
            <DropdownItem icon={<Sigma size={14} />} label="Suma Acumulativa" onClick={cumulativeSum} disabled={!activeCol} />
            <DropdownItem icon={<ListOrdered size={14} />} label="Ranking" onClick={addRanking} disabled={!activeCol} />
            <DropdownItem icon={<Info size={14} />} label="Ver Estadísticas" onClick={showColumnStats} disabled={!activeCol} />
            <DropdownItem icon={<Sigma size={14} />} label="Agrupar y Resumir" onClick={() => setActiveModal('group')} disabled={!activeCol} />
          </DropdownMenu>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-wolf/20 mx-1"></div>
          
          <button onClick={smartClean} title="Limpieza Inteligente" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-persian/10 text-persian hover:bg-persian hover:text-white transition-colors">
            <Sparkles size={16} /> <span className="hidden xl:inline">Smart Clean</span>
          </button>

          <button onClick={() => setCompactMode(!compactMode)} title={compactMode ? "Modo Cómodo" : "Modo Compacto"} className={`p-1.5 rounded-lg transition-colors ${compactMode ? 'text-persian bg-persian/10' : 'text-gray-400 hover:text-gray-600 dark:text-wolf dark:hover:text-zinc'}`}>
            {compactMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          <div className="flex-1"></div>
          
          <button onClick={undoLastAction} disabled={actions.length === 0} title="Deshacer (Ctrl+Z)" className="p-1.5 text-gray-500 hover:text-persian disabled:opacity-30 transition-colors">
            <Undo2 size={18} />
          </button>
          
          {/* Botón para abrir historial si está cerrado */}
          {!historyOpen && (
             <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-gray-500 hover:text-persian bg-gray-100 dark:bg-wolf/10 transition-colors border border-transparent hover:border-persian/20">
               <History size={14} /> Historial
             </button>
          )}
        </div>

        {/* --- MODALES (Preservados del original) --- */}
        {activeModal === 'pad' && <ModalBar title={`Rellenar Ceros ${activeCol}`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Largo:</span><input type="number" className="input-dark w-16" value={padLen} onChange={e => setPadLen(e.target.value)} /><span className="text-xs text-gray-500 dark:text-wolf">Char:</span><input type="text" className="input-dark w-12 text-center" value={padChar} onChange={e => setPadChar(e.target.value)} maxLength={1} /><button onClick={applyPadStart} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'mask' && <ModalBar title={`Enmascarar ${activeCol}`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Visibles:</span><input type="number" className="input-dark w-16" value={maskChars} onChange={e => setMaskChars(e.target.value)} /><button onClick={maskData} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'clip' && <ModalBar title={`Limitar (Clip)`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Mín:</span><input type="number" className="input-dark w-16" value={clipMin} onChange={e => setClipMin(e.target.value)} /><span className="text-xs text-gray-500 dark:text-wolf">Máx:</span><input type="number" className="input-dark w-16" value={clipMax} onChange={e => setClipMax(e.target.value)} /><button onClick={clipValues} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'compare' && <ModalBar title={`Comparar`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Op:</span><select className="input-dark w-12 text-center" value={compOp} onChange={e => setCompOp(e.target.value)}><option value="=">=</option><option value="!=">!=</option></select><span className="text-xs text-gray-500 dark:text-wolf">Con:</span><select className="input-dark w-24" value={compCol2} onChange={e => setCompCol2(e.target.value)}>{columns.filter(c => c !== activeCol).map(c=><option key={c} value={c}>{c}</option>)}</select><button onClick={compareColumns} className="btn-primary-sm">Comparar</button></ModalBar>}
        {activeModal === 'substring' && <ModalBar title={`Subcadena`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">In:</span><input type="number" className="input-dark w-16" value={subStart} onChange={e => setSubStart(e.target.value)} /><span className="text-xs text-gray-500 dark:text-wolf">Largo:</span><input type="number" className="input-dark w-16" value={subLen} onChange={e => setSubLen(e.target.value)} /><button onClick={textSubstring} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'addDays' && <ModalBar title={`Sumar días`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Días:</span><input type="number" className="input-dark w-20" value={addDaysVal} onChange={e => setAddDaysVal(e.target.value)} /><button onClick={addDaysToDate} className="btn-primary-sm">Sumar</button></ModalBar>}
        {activeModal === 'regex' && <ModalBar title="Regex" onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Patrón:</span><input type="text" className="input-dark w-48 font-mono text-xs" value={regexPattern} onChange={e => setRegexPattern(e.target.value)} /><button onClick={applyRegexExtract} className="btn-primary-sm">Extraer</button></ModalBar>}
        {activeModal === 'impute' && <ModalBar title={`Imputar`} onClose={closeModal}><select className="input-dark w-32" value={imputeMethod} onChange={e => setImputeMethod(e.target.value)}><option value="mean">Media</option><option value="median">Mediana</option><option value="mode">Moda</option></select><button onClick={imputeNulls} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'binning' && <ModalBar title={`Binning`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Rango:</span><input type="number" className="input-dark w-20" value={binSize} onChange={e => setBinSize(e.target.value)} /><button onClick={createBinning} className="btn-primary-sm">Crear</button></ModalBar>}
        {activeModal === 'merge' && <ModalBar title={`Unir`} onClose={closeModal}><select className="input-dark w-24" value={mergeCol2} onChange={e => setMergeCol2(e.target.value)}>{columns.filter(c => c !== activeCol).map(c=><option key={c} value={c}>{c}</option>)}</select><span className="text-xs text-gray-500 dark:text-wolf">Sep:</span><input type="text" className="input-dark w-12 text-center" value={mergeSep} onChange={e => setMergeSep(e.target.value)} /><button onClick={mergeColumns} className="btn-primary-sm">Unir</button></ModalBar>}
        {activeModal === 'split' && <ModalBar title={`Dividir`} onClose={closeModal}><span className="text-xs text-gray-500 dark:text-wolf">Delim:</span><input type="text" className="input-dark w-16 text-center" value={splitDelim} onChange={e => setSplitDelim(e.target.value)} /><button onClick={splitColumn} className="btn-primary-sm">Dividir</button></ModalBar>}
        {activeModal === 'affix' && <ModalBar title="Affix" onClose={closeModal}><select className="input-dark w-20" value={affixType} onChange={e => setAffixType(e.target.value)}><option value="prefix">Pre</option><option value="suffix">Suf</option></select><input type="text" className="input-dark w-32" value={affixText} onChange={e => setAffixText(e.target.value)} /><button onClick={addAffix} className="btn-primary-sm">Ok</button></ModalBar>}
        {activeModal === 'conditional' && <ModalBar title="Condicional" onClose={closeModal}><select className="input-dark w-12 text-center" value={condOp} onChange={e => setCondOp(e.target.value)}><option value=">">{'>'}</option><option value="<">{'<'}</option><option value="=">=</option></select><input type="text" className="input-dark w-16" value={condVal} onChange={e => setCondVal(e.target.value)} placeholder="0" /><span className="text-xs">?</span><input type="text" className="input-dark w-16" value={condTrue} onChange={e => setCondTrue(e.target.value)} placeholder="T" /><span className="text-xs">:</span><input type="text" className="input-dark w-16" value={condFalse} onChange={e => setCondFalse(e.target.value)} placeholder="F" /><input type="text" className="input-dark w-20 font-bold text-persian" value={condTarget} onChange={e => setCondTarget(e.target.value)} placeholder="Col" /><button onClick={applyConditional} className="btn-primary-sm">Ok</button></ModalBar>}
        {activeModal === 'filter' && <ModalBar title={`Filtrar`} onClose={closeModal}><select className="input-dark w-24" value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="contains">Contiene</option><option value="equals">Igual</option><option value="greater">Mayor</option></select><input type="text" className="input-dark flex-1" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} autoFocus /><button onClick={applyFilter} className="btn-primary-sm">Ok</button></ModalBar>}
        {activeModal === 'rename' && <ModalBar title={`Renombrar`} onClose={closeModal}><input type="text" className="input-dark w-48" value={newName} onChange={e => setNewName(e.target.value)} autoFocus /><button onClick={renameColumn} className="btn-primary-sm">Guardar</button></ModalBar>}
        {activeModal === 'replace' && <ModalBar title={`Reemplazar`} onClose={closeModal}><input type="text" className="input-dark w-24" value={findText} onChange={e => setFindText(e.target.value)} placeholder="Buscar" /><span className="text-xs text-gray-500 dark:text-wolf">por</span><input type="text" className="input-dark w-24" value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Nuevo" /><button onClick={replaceValues} className="btn-primary-sm">Ok</button></ModalBar>}
        {activeModal === 'fillNulls' && <ModalBar title={`Rellenar vacíos`} onClose={closeModal}><input type="text" className="input-dark w-32" value={fillValue} onChange={e => setFillValue(e.target.value)} /><button onClick={fillNulls} className="btn-primary-sm">Rellenar</button></ModalBar>}
        {activeModal === 'dropRows' && <ModalBar title="Borrar Filas" onClose={closeModal}><input type="number" min="1" className="input-dark w-20" value={rowsToRemove} onChange={e => setRowsToRemove(e.target.value)} /><button onClick={removeTopRows} className="btn-primary-sm bg-red-600">Borrar</button></ModalBar>}
        {activeModal === 'changeType' && <ModalBar title={`Tipo: ${activeCol}`} onClose={closeModal}><select className="input-dark w-32" value={targetType} onChange={e => setTargetType(e.target.value)}><option value="numeric">Número</option><option value="string">Texto</option><option value="date">Fecha</option></select><button onClick={changeType} className="btn-primary-sm">Cambiar</button></ModalBar>}
        {activeModal === 'math' && <ModalBar title="Cálculo" onClose={closeModal}><input type="text" placeholder="Nombre" className="input-dark w-20" value={mathTarget} onChange={e => setMathTarget(e.target.value)} /><span className="text-xs">= {activeCol}</span><select className="input-dark w-10" value={mathOp} onChange={e => setMathOp(e.target.value)}><option value="+">+</option><option value="-">-</option><option value="*">*</option><option value="/">/</option></select><select className="input-dark w-20" value={mathCol2} onChange={e => setMathCol2(e.target.value)}>{columns.map(c=><option key={c} value={c}>{c}</option>)}</select><button onClick={applyMath} className="btn-primary-sm">Calc</button></ModalBar>}
        {activeModal === 'group' && <ModalBar title={`Agrupar`} onClose={closeModal}><select className="input-dark w-20" value={groupOp} onChange={e => setGroupOp(e.target.value)}><option value="SUM">Sumar</option><option value="AVG">Prom</option><option value="COUNT">Contar</option><option value="MAX">Max</option></select><select className="input-dark w-24" value={groupAggCol} onChange={e => setGroupAggCol(e.target.value)}>{columns.map(c=><option key={c} value={c}>{c}</option>)}</select><button onClick={applyGroup} className="btn-primary-sm">Agrupar</button></ModalBar>}
        {activeModal === 'json' && <ModalBar title={`JSON Extract`} onClose={closeModal}><input type="text" className="input-dark w-32" value={jsonKey} onChange={e => setJsonKey(e.target.value)} placeholder="Key" /><button onClick={extractJson} className="btn-primary-sm">Extraer</button></ModalBar>}
        {activeModal === 'round' && <ModalBar title={`Redondear`} onClose={closeModal}><input type="number" min="0" max="10" className="input-dark w-16" value={roundDecimals} onChange={e => setRoundDecimals(e.target.value)} /><button onClick={applyRound} className="btn-primary-sm">Aplicar</button></ModalBar>}

        {activeModal === 'stats' && colStats && (
          <div className="absolute top-16 right-4 z-50 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 p-4 rounded-xl shadow-2xl w-64 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-wolf/20 pb-2">
              <h3 className="font-bold text-gray-800 dark:text-zinc flex items-center gap-2"><Info size={16} className="text-persian"/> Estadísticas</h3>
              <button onClick={() => setActiveModal(null)}><XCircle size={16} className="text-gray-400 dark:text-wolf hover:text-red-400"/></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Columna:</span> <span className="font-bold text-persian">{activeCol}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Tipo:</span> <span className="text-gray-800 dark:text-zinc">{colStats.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Llenos:</span> <span className="text-green-600 dark:text-green-400">{colStats.filled}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Vacíos:</span> <span className="text-red-500 dark:text-red-400">{colStats.empty}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Únicos:</span> <span className="text-blue-500 dark:text-blue-400">{colStats.unique}</span></div>
              {colStats.min !== '-' && (
                <>
                  <div className="border-t border-gray-200 dark:border-wolf/10 my-2"></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Min:</span> <span className="text-gray-800 dark:text-zinc">{colStats.min}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Max:</span> <span className="text-gray-800 dark:text-zinc">{colStats.max}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Promedio:</span> <span className="text-gray-800 dark:text-zinc">{colStats.avg}</span></div>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- TABLA DE DATOS (ÁREA PRINCIPAL) --- */}
        <div className="flex-1 overflow-auto relative custom-scrollbar bg-white dark:bg-carbon-light z-0 rounded-b-xl">
        {/* Se añadió rounded-b-xl */}
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-carbon sticky top-0 z-10 shadow-sm">
              <tr>
                <th className={`w-12 text-center text-xs font-medium text-gray-500 border-b border-gray-200 dark:border-wolf/20 ${compactMode ? 'p-1' : 'p-3'}`}>#</th>
                {columns.map((col, idx) => {
                  const type = inferType(data[0][col]);
                  return (
                    <th key={idx} onClick={() => setActiveCol(col)} className={`cursor-pointer transition-colors border-b border-gray-200 dark:border-wolf/20 ${compactMode ? 'p-2' : 'p-3'} ${activeCol === col ? 'bg-persian/10 text-persian border-b-2 border-persian' : 'hover:bg-gray-200 dark:hover:bg-wolf/10 text-gray-500 dark:text-wolf'}`}>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                          {type === 'number' && <Hash size={10} className="opacity-50"/>}
                          {type === 'text' && <Type size={10} className="opacity-50"/>}
                          {type === 'date' && <Calendar size={10} className="opacity-50"/>}
                          <span className="truncate max-w-[150px]">{col}</span>
                          {activeCol === col && <Filter size={10} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-carbon-light divide-y divide-gray-100 dark:divide-wolf/5">
              {data.slice(0, 100).map((row, i) => (
                <tr key={i} className="hover:bg-persian/5 group transition-colors">
                  <td className={`text-center text-xs text-gray-400 dark:text-wolf/50 font-mono border-r border-gray-100 dark:border-wolf/10 group-hover:text-gray-600 dark:group-hover:text-wolf ${compactMode ? 'py-1' : 'py-3'}`}>{i + 1}</td>
                  {columns.map((col, j) => (
                    <td key={j} className={`text-sm whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis text-gray-700 dark:text-zinc/80 ${compactMode ? 'p-1.5' : 'p-3'} ${activeCol === col ? 'bg-persian/5 font-medium' : ''}`}>
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-1 text-center text-[10px] text-gray-400 dark:text-wolf bg-gray-50 dark:bg-carbon border-t border-gray-200 dark:border-wolf/20 sticky bottom-0">
             Mostrando vista previa (100 filas)
          </div>
        </div>
      </div>

      {/* ----------------- HISTORIAL (Colapsable) ----------------- */}
      <div className={`
        transition-all duration-300 ease-in-out bg-white dark:bg-carbon-light flex flex-col shadow-2xl relative z-30 h-full rounded-xl border border-gray-200 dark:border-wolf/10 overflow-hidden ml-3
        ${historyOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-0 ml-0'}
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-wolf/20 bg-gray-50 dark:bg-[#1a1a1a] flex justify-between items-center h-[53px]">
          <h3 className="font-bold text-gray-800 dark:text-zinc flex items-center gap-2 text-sm">
            <History size={16} className="text-persian" /> Historial
          </h3>
          <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-carbon-light">
          {actions.length === 0 ? (
            <div className="text-center mt-10 opacity-50">
               <History size={40} className="mx-auto mb-2 text-gray-300 dark:text-wolf"/>
               <p className="text-xs text-gray-400">Sin acciones registradas</p>
            </div>
          ) : (
            actions.map((action, idx) => (
              <div key={idx} className="group relative pl-4 pb-4 border-l-2 border-gray-200 dark:border-wolf/10 last:border-0 last:pb-0">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-persian border-4 border-white dark:border-[#2d2d2d] shadow-sm"></div>
                 <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-wolf/10 hover:border-persian/30 transition-colors cursor-pointer group-hover:shadow-md">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-xs font-bold text-gray-700 dark:text-zinc uppercase tracking-wide">{action.type}</span>
                     <span className="text-[10px] text-gray-400 font-mono">#{idx+1}</span>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-wolf leading-relaxed">{action.description}</p>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- UTILIDADES GRÁFICAS (Preservadas) ---
const DropdownMenu = ({ label, icon, children, isOpen, onClick }) => {
  const [term, setTerm] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); setTerm(''); } }, [isOpen]);
  const items = React.Children.toArray(children).filter(child => {
    if (!child.props || !child.props.label) return true;
    if (term.trim() !== '') return child.props.label.toLowerCase().includes(term.toLowerCase());
    return true;
  });
  return (
    <div className="relative">
      <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all select-none border ${isOpen ? 'bg-persian/10 text-persian border-persian/30' : 'text-gray-600 dark:text-wolf border-transparent hover:bg-gray-100 dark:hover:bg-wolf/10 hover:text-gray-900 dark:hover:text-zinc'}`}>
        {icon} {label} <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-wolf/20 rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-black/5">
          <div className="p-2 border-b border-gray-100 dark:border-wolf/10 bg-gray-50 dark:bg-black/20">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400 dark:text-wolf/70" />
              <input ref={inputRef} type="text" placeholder="Buscar..." className="w-full bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg pl-8 pr-2 py-1.5 text-xs text-gray-700 dark:text-zinc focus:outline-none focus:border-persian placeholder:text-gray-400 dark:placeholder:text-wolf/50" value={term} onChange={(e) => setTerm(e.target.value)} onClick={(e) => e.stopPropagation()} />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {items.length > 0 ? items : <div className="p-4 text-center text-xs text-gray-400 dark:text-wolf opacity-70">Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon, label, onClick, disabled, danger }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left rounded-lg transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : danger ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-700 dark:text-zinc hover:bg-gray-100 dark:hover:bg-persian/5 hover:text-persian'}`}>
    {icon} {label}
  </button>
);

const ModalBar = ({ title, children, onClose }) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-2 px-3 rounded-lg border border-persian/30 shadow-lg flex gap-2 items-center animate-in slide-in-from-top-2 flex-wrap relative pr-8 mx-1 z-20 ring-1 ring-black/5">
     <span className="text-xs font-bold text-persian whitespace-nowrap border-r border-gray-200 dark:border-wolf/20 pr-2 mr-1">{title}</span>
     {children}
     <button onClick={onClose} className="absolute right-2 top-2.5 text-gray-400 dark:text-wolf hover:text-red-400"><XCircle size={14}/></button>
  </div>
);