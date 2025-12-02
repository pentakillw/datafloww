import { useData } from '../context/DataContext.jsx';

// --- HELPERS DE SEGURIDAD ---
const safeStr = (val) => (val === null || val === undefined) ? '' : String(val);
const safeNum = (val) => {
  if (val === null || val === undefined || val === '') return NaN;
  const n = parseFloat(val);
  return isFinite(n) ? n : NaN;
};
const isValidDate = (d) => d instanceof Date && !isNaN(d);

export function useDataTransform() {
  const { data, setData, columns, setColumns, logAction, showToast, setHistory } = useData();

  // ==========================================
  // MOTOR DE INFERENCIA HEURÍSTICA (CEREBRO IA V2)
  // ==========================================
  
  const inferTransformation = (sourceData, examplesMap, limitToCols = null) => {
    const exampleIndices = Object.keys(examplesMap).map(Number);
    if (exampleIndices.length === 0) return null;

    // Usamos el primer ejemplo para generar hipótesis
    const firstIdx = exampleIndices[0];
    const firstTarget = examplesMap[firstIdx];
    const firstRow = sourceData[firstIdx];
    
    if (firstTarget === undefined || firstTarget === null) return null;

    const candidates = [];
    // Determinar qué columnas escanear
    const colsToScan = limitToCols || Object.keys(firstRow);

    // 1. GENERAR CANDIDATOS SIMPLES
    colsToScan.forEach(col => {
        const sourceVal = safeStr(firstRow[col]);
        if (!sourceVal) return;

        // A. Copia Exacta
        if (sourceVal === firstTarget) candidates.push({ type: 'copy', col });
        
        // B. Transformaciones de Texto
        if (sourceVal.toUpperCase() === firstTarget) candidates.push({ type: 'upper', col });
        if (sourceVal.toLowerCase() === firstTarget) candidates.push({ type: 'lower', col });
        if (sourceVal.trim() === firstTarget) candidates.push({ type: 'trim', col });

        // C. Substring Simple
        if (sourceVal.startsWith(firstTarget)) candidates.push({ type: 'substring_start', col, len: firstTarget.length });
        if (sourceVal.endsWith(firstTarget)) candidates.push({ type: 'substring_end', col, len: firstTarget.length });

        // D. Extracción Inteligente (Text Between Delimiters)
        if (sourceVal.includes(firstTarget) && firstTarget.length < sourceVal.length) {
            const startIdx = sourceVal.indexOf(firstTarget);
            const endIdx = startIdx + firstTarget.length;
            
            const before = sourceVal.substring(0, startIdx);
            const after = sourceVal.substring(endIdx);

            // Analizar delimitador ANTES
            let startDelim = '';
            if (before.length > 0) {
                const match = before.match(/[^a-zA-Z0-9\s]+$/); 
                if (match) startDelim = match[0];
                else if (before.endsWith(' ')) startDelim = ' ';
            }

            // Analizar delimitador DESPUÉS
            let endDelim = '';
            if (after.length > 0) {
                const match = after.match(/^[^a-zA-Z0-9\s]+/);
                if (match) endDelim = match[0];
                else if (after.startsWith(' ')) endDelim = ' ';
            }

            if (startDelim || endDelim) {
                candidates.push({ type: 'extract_between', col, startDelim, endDelim });
            }
        }
    });

    // 2. GENERAR CANDIDATOS COMPLEJOS (TEMPLATE / MERGE)
    const partsFound = [];
    colsToScan.forEach(col => {
        const val = safeStr(firstRow[col]);
        // Solo considerar valores significativos (>1 char) para evitar ruido
        if (val && val.length > 0 && firstTarget.includes(val)) {
            let pos = firstTarget.indexOf(val);
            while (pos !== -1) {
                const isOverlapping = partsFound.some(p => 
                    (pos >= p.start && pos < p.end) || (pos + val.length > p.start && pos + val.length <= p.end)
                );
                
                if (!isOverlapping) {
                    partsFound.push({ type: 'col', val: col, start: pos, end: pos + val.length });
                }
                pos = firstTarget.indexOf(val, pos + 1);
            }
        }
    });

    partsFound.sort((a, b) => a.start - b.start);

    if (partsFound.length > 0) {
        const template = [];
        let cursor = 0;
        
        partsFound.forEach(part => {
            if (part.start > cursor) {
                template.push({ type: 'static', val: firstTarget.substring(cursor, part.start) });
            }
            template.push({ type: 'col', val: part.val });
            cursor = part.end;
        });
        
        if (cursor < firstTarget.length) {
            template.push({ type: 'static', val: firstTarget.substring(cursor) });
        }

        if (template.some(t => t.type === 'col')) {
            candidates.push({ type: 'template', template });
        }
    }

    // 3. VALIDACIÓN (Cross-Validation)
    const validRule = candidates.find(rule => {
        return exampleIndices.every(idx => {
            const row = sourceData[idx];
            const target = examplesMap[idx];
            if (!row) return false;
            
            const predicted = applyRuleToRow(row, rule);
            return predicted === target;
        });
    });

    return validRule;
  };

  // Función para aplicar una regla inferida a una fila
  const applyRuleToRow = (row, rule) => {
      if (!rule) return '';
      try {
          if (rule.type === 'template') {
              return rule.template.map(part => {
                  if (part.type === 'static') return part.val;
                  if (part.type === 'col') return safeStr(row[part.val]);
                  return '';
              }).join('');
          }
          
          const val = safeStr(row[rule.col]);
          
          if (rule.type === 'copy') return val;
          if (rule.type === 'upper') return val.toUpperCase();
          if (rule.type === 'lower') return val.toLowerCase();
          if (rule.type === 'trim') return val.trim();
          if (rule.type === 'substring_start') return val.substring(0, rule.len);
          if (rule.type === 'substring_end') return val.slice(-rule.len);
          
          if (rule.type === 'extract_between') {
              let startIdx = 0;
              if (rule.startDelim) {
                  const sIdx = val.indexOf(rule.startDelim);
                  if (sIdx !== -1) startIdx = sIdx + rule.startDelim.length;
                  else return ''; 
              }
              let sub = val.substring(startIdx);
              if (rule.endDelim) {
                  const eIdx = sub.indexOf(rule.endDelim);
                  if (eIdx !== -1) sub = sub.substring(0, eIdx);
              }
              return sub;
          }
      } catch {
          return '';
      }
      return '';
  };

  const generateColumnFromExamples = (newColName, examplesMap) => {
      // Re-inferimos usando todas las columnas por defecto si no se especifica scope, 
      // o confiamos en que el usuario ya validó visualmente.
      const rule = inferTransformation(data, examplesMap); 
      
      if (!rule) {
          showToast('No se pudo confirmar el patrón. Intenta agregar más ejemplos.', 'error');
          return;
      }

      const newData = data.map(row => ({
          ...row,
          [newColName]: applyRuleToRow(row, rule)
      }));

      setData(newData);
      setColumns([...columns, newColName]);
      
      let desc = `Columna inteligente '${newColName}'`;
      if(rule.type === 'template') desc += ` (Combinación)`;
      else if(rule.type === 'extract_between') desc += ` (Extracción)`;
      else desc += ` (${rule.type})`;

      logAction({ type: 'FROM_EXAMPLES', description: desc });
      showToast('Columna inteligente creada correctamente', 'success');
  };

  const reorderColumns = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= columns.length || toIndex >= columns.length) return;
    setHistory(prev => [...prev, { data, columns }]);
    const newCols = [...columns];
    const [movedCol] = newCols.splice(fromIndex, 1);
    newCols.splice(toIndex, 0, movedCol);
    setColumns(newCols);
    logAction({ type: 'REORDER_COLS', newOrder: newCols, description: `Mover columna '${movedCol}'` });
  };

  const moveColumn = (col, direction) => {
    const idx = columns.indexOf(col);
    if (idx < 0) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    reorderColumns(idx, targetIdx);
  };

  const duplicateColumn = (col) => {
    if (!col) return;
    let newName = `${col}_Copy`;
    let i = 1;
    while(columns.includes(newName)) { newName = `${col}_Copy${i}`; i++; }
    const colIndex = columns.indexOf(col);
    const newColumns = [...columns];
    newColumns.splice(colIndex + 1, 0, newName);
    const newData = data.map(row => ({ ...row, [newName]: row[col] }));
    setData(newData);
    setColumns(newColumns);
    logAction({ type: 'DUPLICATE', col, description: `Duplicar columna ${col}` });
    showToast(`Columna duplicada como ${newName}`, 'success');
  };

  const applyFilter = (col, condition, value) => {
    if (!col) return;
    const initialCount = data.length;
    const searchVal = value.toString().toLowerCase();
    const isNumericFilter = ['>', '<', '=', '>=', '<='].includes(condition);
    const newData = data.filter(row => {
      const cellVal = row[col];
      if (isNumericFilter) {
        const nCell = parseFloat(cellVal);
        const nSearch = parseFloat(value);
        if (isNaN(nCell) || isNaN(nSearch)) return false; 
        if (condition === '=') return nCell === nSearch;
        if (condition === '>') return nCell > nSearch;
        if (condition === '<') return nCell < nSearch;
        if (condition === '>=') return nCell >= nSearch;
        if (condition === '<=') return nCell <= nSearch;
      } else {
        const sCell = safeStr(cellVal).toLowerCase();
        if (condition === 'contains') return sCell.includes(searchVal);
        if (condition === 'not_contains') return !sCell.includes(searchVal);
        if (condition === 'starts_with') return sCell.startsWith(searchVal);
        if (condition === 'ends_with') return sCell.endsWith(searchVal);
        if (condition === 'equals') return sCell === searchVal;
        if (condition === 'empty') return sCell === '';
        if (condition === 'not_empty') return sCell !== '';
      }
      return true;
    });
    if (newData.length === initialCount) {
        showToast('El filtro no afectó a ninguna fila.', 'info');
    } else {
        setData(newData);
        logAction({ type: 'FILTER', col, condition, val: value, description: `Filtrar ${col}` });
        showToast(`Filtrado aplicado. Quedan ${newData.length} filas.`, 'success');
    }
  };

  const addCustomColumn = (newColName, formulaStr) => {
    try {
        const safeFormula = formulaStr.includes('return') ? formulaStr : `return ${formulaStr}`;
        const func = new Function('row', `try { with(row) { ${safeFormula} } } catch(e) { return null; }`);
        const newData = data.map(row => {
            const numericRow = { ...row };
            Object.keys(numericRow).forEach(k => {
                const n = parseFloat(numericRow[k]);
                if (!isNaN(n) && isFinite(n)) numericRow[k] = n;
            });
            const res = func(numericRow);
            return { ...row, [newColName]: res };
        });
        setData(newData);
        setColumns([...columns, newColName]);
        logAction({ type: 'ADD_CUSTOM', description: `Columna Personalizada: ${newColName}` });
        showToast('Columna personalizada agregada', 'success');
    } catch (e) {
        showToast('Error en la fórmula', 'error');
    }
  };

  const addConditionalColumn = (newColName, rules, elseValue) => {
    const newData = data.map(row => {
        let result = elseValue;
        for (const rule of rules) {
            const rowVal = row[rule.col];
            let match = false;
            const nRow = parseFloat(rowVal);
            const nRule = parseFloat(rule.val);
            const isNum = !isNaN(nRow) && !isNaN(nRule);
            switch (rule.op) {
                case 'equals': match = String(rowVal) === String(rule.val); break;
                case 'not_equals': match = String(rowVal) !== String(rule.val); break;
                case 'contains': match = safeStr(rowVal).toLowerCase().includes(String(rule.val).toLowerCase()); break;
                case 'starts_with': match = safeStr(rowVal).toLowerCase().startsWith(String(rule.val).toLowerCase()); break;
                case '>': match = isNum && nRow > nRule; break;
                case '>=': match = isNum && nRow >= nRule; break;
                case '<': match = isNum && nRow < nRule; break;
                case '<=': match = isNum && nRow <= nRule; break;
                case 'is_null': match = rowVal === null || rowVal === undefined || rowVal === ''; break;
                default: match = false;
            }
            if (match) { result = rule.output; break; }
        }
        return { ...row, [newColName]: result };
    });
    setData(newData);
    setColumns([...columns, newColName]);
    logAction({ type: 'ADD_CONDITIONAL', description: `Columna Condicional: ${newColName}` });
    showToast('Columna condicional agregada', 'success');
  };

  // --- OTRAS FUNCIONES ---
  const applyZScore = (col) => {
    if (!col) return;
    const values = data.map(r => safeNum(r[col])).filter(n => !isNaN(n));
    if (values.length === 0) return showToast('Columna sin datos numéricos', 'error');
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const newCol = `${col}_ZScore`;
    const newData = data.map(r => {
        const val = safeNum(r[col]);
        const z = !isNaN(val) ? ((val - mean) / stdDev).toFixed(4) : null;
        return { ...r, [newCol]: z ? parseFloat(z) : null };
    });
    setData(newData);
    setColumns([...columns, newCol]);
    logAction({ type: 'Z-SCORE', col, description: `Estandarización Z-Score en ${col}` });
  };

  const applyMinMax = (col) => {
    if (!col) return;
    const values = data.map(r => safeNum(r[col])).filter(n => !isNaN(n));
    if (values.length === 0) return showToast('Columna sin datos numéricos', 'error');
    const min = Math.min(...values);
    const max = Math.max(...values);
    const newCol = `${col}_Norm`;
    const newData = data.map(r => {
        const val = safeNum(r[col]);
        const norm = !isNaN(val) ? ((val - min) / (max - min)).toFixed(4) : null;
        return { ...r, [newCol]: norm ? parseFloat(norm) : null };
    });
    setData(newData);
    setColumns([...columns, newCol]);
    logAction({ type: 'MIN-MAX', col, description: `Normalización (0-1) en ${col}` });
  };

  const applyOneHotEncoding = (col) => {
    if (!col) return;
    const counts = {};
    data.forEach(r => { const v = safeStr(r[col]); counts[v] = (counts[v] || 0) + 1; });
    const topCategories = Object.keys(counts).sort((a,b) => counts[b] - counts[a]).slice(0, 10); 
    let newData = [...data];
    let newCols = [];
    topCategories.forEach(cat => {
        if(cat === '') return;
        const nc = `${col}_${cat.replace(/[^a-zA-Z0-9]/g, '')}`; 
        newCols.push(nc);
        newData = newData.map(r => ({ ...r, [nc]: safeStr(r[col]) === cat ? 1 : 0 }));
    });
    setData(newData);
    setColumns([...columns, ...newCols]);
    logAction({ type: 'ONE-HOT', col, description: `One-Hot Encoding (${newCols.length} cols)` });
  };

  const smartClean = () => {
    const initialCount = data.length;
    let newData = data.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        let val = newRow[key];
        if (typeof val === 'string') { val = val.trim(); if (['null', 'undefined', 'nan', ''].includes(val.toLowerCase())) val = null; }
        if (val !== null && !isNaN(Number(val)) && val !== '' && typeof val === 'string' && !val.startsWith('0')) { val = Number(val); }
        newRow[key] = val;
      });
      return newRow;
    });
    newData = newData.filter(row => Object.values(row).some(v => v !== null && v !== ''));
    const uniqueData = Array.from(new Set(newData.map(r => JSON.stringify(r)))).map(s => JSON.parse(s));
    setData(uniqueData);
    logAction({ type: 'SMART_CLEAN', description: 'Limpieza Automática Completa' });
    showToast(`Limpieza completada. ${initialCount - uniqueData.length} registros eliminados.`, 'success');
  };

  const dropColumn = (col) => {
    if (!col) return;
    const newData = data.map(row => { const newRow = { ...row }; delete newRow[col]; return newRow; });
    setColumns(columns.filter(c => c !== col));
    setData(newData);
    logAction({ type: 'DROP_COL', col, description: `Eliminar columna ${col}` });
  };

  const promoteHeaders = () => {
    if (data.length < 1) return;
    const newHeaders = columns.map(c => safeStr(data[0][c]).trim() || c);
    setColumns(newHeaders);
    setData(data.slice(1).map(r => { const nr = {}; columns.forEach((old, i) => nr[newHeaders[i]] = r[old]); return nr; }));
    logAction({ type: 'PROMOTE', description: 'Promover encabezados' });
  };

  const addIndexColumn = () => {
    const nc = 'ID';
    setColumns([nc, ...columns]);
    setData(data.map((r, i) => ({ [nc]: i + 1, ...r })));
    logAction({ type: 'ADD_INDEX', description: 'Agregar Índice' });
  };

  const removeTopRows = (count) => {
    const n = parseInt(count);
    if (n > 0) { setData(data.slice(n)); logAction({ type: 'DROP_TOP', count: n, description: `Eliminar ${n} filas sup.` }); }
  };

  const renameColumn = (oldName, newName) => {
    if (!oldName || !newName) return;
    const newData = data.map(r => { const newRow = { ...r }; newRow[newName] = newRow[oldName]; delete newRow[oldName]; return newRow; });
    setColumns(columns.map(c => c === oldName ? newName : c));
    setData(newData);
    logAction({ type: 'RENAME', col: oldName, newVal: newName, description: `Renombrar a ${newName}` });
  };

  const removeDuplicates = () => {
    const u = Array.from(new Set(data.map(r => JSON.stringify(r)))).map(s => JSON.parse(s));
    setData(u);
    logAction({ type: 'DEDUP', description: 'Eliminar duplicados' });
  };

  const dropNulls = () => {
    setData(data.filter(r => Object.values(r).some(v => v !== null && v !== '')));
    logAction({ type: 'DROP_NULLS', description: 'Eliminar filas vacías' });
  };

  const fillDown = (col) => {
    if (!col) return;
    let last = null;
    const newData = data.map(r => { const v = r[col]; if (v !== null && v !== '') last = v; return { ...r, [col]: last }; });
    setData(newData);
    logAction({ type: 'FILL_DOWN', col, description: 'Rellenar abajo' });
  };

  const cleanSymbols = (col) => {
    if (!col) return;
    setData(data.map(r => ({ ...r, [col]: safeStr(r[col]).replace(/[^a-zA-Z0-9\s]/g, '') })));
    logAction({ type: 'SYMBOLS', col, description: 'Limpiar símbolos' });
  };

  const imputeNulls = (col, method) => {
    if (!col) return;
    const vals = data.map(r => safeNum(r[col])).filter(n => !isNaN(n));
    if (!vals.length) return showToast('Sin datos numéricos', 'error');
    let rep = 0;
    if (method === 'mean') rep = vals.reduce((a, b) => a + b, 0) / vals.length;
    else if (method === 'median') { vals.sort((a, b) => a - b); rep = vals[Math.floor(vals.length / 2)]; } 
    else { const c = {}; vals.forEach(v => c[v] = (c[v] || 0) + 1); rep = parseFloat(Object.keys(c).reduce((a, b) => c[a] > c[b] ? a : b)); }
    setData(data.map(r => ({ ...r, [col]: (r[col] === null || r[col] === '' || isNaN(r[col])) ? Number(rep.toFixed(2)) : r[col] })));
    logAction({ type: 'IMPUTE', col, method, description: `Imputar ${method}` });
  };

  const fillNullsVar = (col, value) => {
    if (!col) return;
    setData(data.map(r => ({ ...r, [col]: (r[col] === null || r[col] === '') ? value : r[col] })));
    logAction({ type: 'FILL_VAL', col, val: value, description: `Rellenar con '${value}'` });
  };

  const changeType = (col, targetType) => {
    if (!col) return;
    const newData = data.map(r => {
        let v = r[col];
        if (targetType === 'numeric') v = safeNum(v);
        else if (targetType === 'string') v = safeStr(v);
        else if (targetType === 'date') { const d = new Date(v); v = isValidDate(d) ? d.toISOString().split('T')[0] : null; }
        return { ...r, [col]: v };
    });
    setData(newData);
    logAction({ type: 'CHANGE_TYPE', col, to: targetType, description: `Cambiar tipo a ${targetType}` });
  };

  const handleCase = (col, mode) => {
    if (!col) return;
    const newData = data.map(r => {
        const val = safeStr(r[col]);
        let newVal = val;
        if (mode === 'upper') newVal = val.toUpperCase();
        else if (mode === 'lower') newVal = val.toLowerCase();
        else if (mode === 'title') newVal = val.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
        return { ...r, [col]: newVal };
    });
    setData(newData);
    logAction({ type: 'CASE', col, mode, description: `Texto a ${mode}` });
  };

  const trimText = (col) => { setData(data.map(r => ({ ...r, [col]: safeStr(r[col]).trim() }))); logAction({ type: 'TRIM', col }); };

  const replaceValues = (col, find, replace) => {
    if (!col) return;
    setData(data.map(r => ({ ...r, [col]: safeStr(r[col]).replaceAll(find, replace) })));
    logAction({ type: 'REPLACE', col, description: `Reemplazar '${find}'` });
  };

  const splitColumn = (col, delim) => {
    if (!col) return;
    const c1 = `${col}_1`;
    const c2 = `${col}_2`;
    setData(data.map(r => { const p = safeStr(r[col]).split(delim); return { ...r, [c1]: p[0] || '', [c2]: p.slice(1).join(delim) || '' }; }));
    setColumns([...columns, c1, c2]);
    logAction({ type: 'SPLIT', col, description: `Dividir por '${delim}'` });
  };

  const mergeColumns = (col1, col2, sep) => {
    if (!col1 || !col2) return;
    const nc = `${col1}_${col2}`;
    setData(data.map(r => ({ ...r, [nc]: `${safeStr(r[col1])}${sep}${safeStr(r[col2])}` })));
    setColumns([...columns, nc]);
    logAction({ type: 'MERGE', description: `Unir ${col1} y ${col2}` });
  };

  const addAffix = (col, text, type) => {
    if (!col) return;
    setData(data.map(r => ({ ...r, [col]: type === 'prefix' ? `${text}${safeStr(r[col])}` : `${safeStr(r[col])}${text}` })));
    logAction({ type: 'AFFIX', col, description: `Agregar ${type}` });
  };

  const textSubstring = (col, start, len) => {
    if (!col) return;
    const s = parseInt(start) || 0;
    const l = parseInt(len) || 5;
    const nc = `${col}_Sub`;
    setData(data.map(r => ({ ...r, [nc]: safeStr(r[col]).substr(s, l) })));
    setColumns([...columns, nc]);
    logAction({ type: 'SUBSTR', col, description: `Subcadena [${s}, ${l}]` });
  };

  const applyRegexExtract = (col, pattern) => {
    if (!col) return;
    try { const re = new RegExp(pattern); const nc = `${col}_Regex`; setData(data.map(r => { const m = safeStr(r[col]).match(re); return { ...r, [nc]: m ? m[0] : '' }; })); setColumns([...columns, nc]); logAction({ type: 'REGEX', col, description: 'Extraer Regex' }); } 
    catch (e) { showToast('Regex inválida', 'error'); }
  };

  const maskData = (col, visibleChars) => {
    if (!col) return;
    const v = parseInt(visibleChars) || 4;
    setData(data.map(r => { const s = safeStr(r[col]); const visible = s.slice(-v); return { ...r, [col]: '*'.repeat(Math.max(0, s.length - v)) + visible }; }));
    logAction({ type: 'MASK', col, description: 'Enmascarar datos' });
  };

  const applyPadStart = (col, length, char) => {
    if (!col) return;
    const l = parseInt(length) || 5;
    setData(data.map(r => ({ ...r, [col]: safeStr(r[col]).padStart(l, char) })));
    logAction({ type: 'PAD', col, description: `Pad Start ${l}` });
  };

  const extractJson = (col, key) => {
    if (!col) return;
    const nc = `${col}_${key}`;
    setData(data.map(r => { try { const val = r[col]; const o = (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) ? JSON.parse(val) : val; return { ...r, [nc]: o?.[key] || '' }; } catch (error) { return { ...r, [nc]: '' }; } }));
    setColumns([...columns, nc]);
    logAction({ type: 'JSON', col, description: `Extraer JSON ${key}` });
  };

  const applyMath = (col1, col2, op, targetName) => {
    if (!col1 || !col2) return;
    setData(data.map(r => { const v1 = safeNum(r[col1]); const v2 = safeNum(r[col2]); let res = null; if (!isNaN(v1) && !isNaN(v2)) { if (op === '+') res = v1 + v2; if (op === '-') res = v1 - v2; if (op === '*') res = v1 * v2; if (op === '/') res = v2 !== 0 ? v1 / v2 : 0; } return { ...r, [targetName]: res !== null ? Number(res.toFixed(2)) : null }; }));
    if (!columns.includes(targetName)) setColumns([...columns, targetName]);
    logAction({ type: 'CALC', description: `Calculo ${op}` });
  };

  const applyGroup = (groupByCol, aggCol, op) => {
    if (!groupByCol || !aggCol) return;
    const g = {};
    data.forEach(r => { const key = r[groupByCol] || 'Otros'; if (!g[key]) g[key] = []; g[key].push(safeNum(r[aggCol])); });
    const newData = Object.keys(g).map(k => { const vals = g[k].filter(n => !isNaN(n)); let res = 0; if (op === 'SUM') res = vals.reduce((a, b) => a + b, 0); if (op === 'AVG') res = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; if (op === 'COUNT') res = vals.length; if (op === 'MAX') res = vals.length ? Math.max(...vals) : 0; if (op === 'MIN') res = vals.length ? Math.min(...vals) : 0; return { [groupByCol]: k, [`${op}_${aggCol}`]: Number(res.toFixed(2)) }; });
    setData(newData);
    setColumns([groupByCol, `${op}_${aggCol}`]);
    logAction({ type: 'GROUP', description: `Agrupar por ${groupByCol}` });
  };

  const applyConditional = (col, op, val, trueVal, falseVal, target) => {
    if (!col) return;
    setData(data.map(r => { const v = r[col]; let match = false; if (!isNaN(parseFloat(v)) && !isNaN(parseFloat(val))) { const n1 = parseFloat(v); const n2 = parseFloat(val); if (op === '>') match = n1 > n2; if (op === '<') match = n1 < n2; if (op === '=') match = n1 === n2; if (op === '!=') match = n1 !== n2; } else { if (op === '=') match = v === val; if (op === '!=') match = v !== val; } return { ...r, [target]: match ? trueVal : falseVal }; }));
    if (!columns.includes(target)) setColumns([...columns, target]);
    logAction({ type: 'COND', description: 'Condicional aplicada' });
  };

  const compareColumns = (col1, col2) => {
    if (!col1 || !col2) return;
    const nc = `${col1}_vs_${col2}`;
    setData(data.map(r => ({ ...r, [nc]: r[col1] === r[col2] })));
    setColumns([...columns, nc]);
    logAction({ type: 'COMPARE', description: `Comparar ${col1} vs ${col2}` });
  };

  const createBinning = (col, size) => {
    if (!col) return;
    const s = parseFloat(size) || 10;
    const nc = `${col}_Bin`;
    setData(data.map(r => { const v = safeNum(r[col]); if (isNaN(v)) return { ...r, [nc]: '' }; const b = Math.floor(v / s) * s; return { ...r, [nc]: `${b}-${b + s}` }; }));
    setColumns([...columns, nc]);
    logAction({ type: 'BINNING', description: `Rangos de ${s}` });
  };

  const clipValues = (col, min, max) => {
    if (!col) return;
    const nMin = parseFloat(min);
    const nMax = parseFloat(max);
    setData(data.map(r => { let v = safeNum(r[col]); if (!isNaN(v)) v = Math.max(nMin, Math.min(nMax, v)); return { ...r, [col]: v }; }));
    logAction({ type: 'CLIP', description: `Limitar [${min}, ${max}]` });
  };

  const applyRound = (col, decimals) => {
    if (!col) return;
    const d = parseInt(decimals) || 0;
    setData(data.map(r => { const v = safeNum(r[col]); return { ...r, [col]: !isNaN(v) ? Number(v.toFixed(d)) : r[col] }; }));
    logAction({ type: 'ROUND', description: `Redondear a ${d}` });
  };

  const sortData = (col, direction) => {
    if (!col) return;
    const sorted = [...data].sort((a, b) => { if (a[col] < b[col]) return direction === 'asc' ? -1 : 1; if (a[col] > b[col]) return direction === 'asc' ? 1 : -1; return 0; });
    setData(sorted);
    logAction({ type: 'SORT', description: `Ordenar ${direction}` });
  };

  const shuffleData = () => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setData(shuffled);
    logAction({ type: 'SHUFFLE', description: 'Orden aleatorio' });
  };

  const extractDatePart = (col, part) => {
    if (!col) return;
    const nc = `${col}_${part.toUpperCase()}`;
    setData(data.map(r => { const d = new Date(r[col]); let res = null; if (isValidDate(d)) { if (part === 'year') res = d.getFullYear(); if (part === 'month') res = d.getMonth() + 1; if (part === 'day') res = d.getDate(); if (part === 'weekday') res = d.toLocaleDateString('es-ES', { weekday: 'long' }); } return { ...r, [nc]: res }; }));
    setColumns([...columns, nc]);
    logAction({ type: 'DATE', description: `Extraer ${part}` });
  };

  const addDaysToDate = (col, days) => {
    if (!col) return;
    const d = parseInt(days) || 0;
    setData(data.map(r => { const dt = new Date(r[col]); if (isValidDate(dt)) { dt.setDate(dt.getDate() + d); return { ...r, [col]: dt.toISOString().split('T')[0] }; } return r; }));
    logAction({ type: 'ADD_DAYS', description: `Sumar ${d} días` });
  };

  return {
    smartClean,
    applyFilter, 
    reorderColumns,
    moveColumn,
    duplicateColumn,
    dropColumn,
    promoteHeaders,
    addIndexColumn,
    removeTopRows,
    renameColumn,
    removeDuplicates,
    dropNulls,
    fillDown,
    cleanSymbols,
    imputeNulls,
    fillNullsVar,
    changeType,
    handleCase,
    trimText,
    replaceValues,
    splitColumn,
    mergeColumns,
    addAffix,
    textSubstring,
    applyRegexExtract,
    maskData,
    applyPadStart,
    extractJson,
    applyMath,
    applyGroup,
    applyConditional,
    compareColumns,
    createBinning,
    clipValues,
    applyRound,
    sortData,
    shuffleData,
    extractDatePart,
    addDaysToDate,
    applyZScore,
    applyMinMax,
    applyOneHotEncoding,
    addCustomColumn,
    addConditionalColumn,
    generateColumnFromExamples,
    inferTransformation,
    applyRuleToRow
  };
}