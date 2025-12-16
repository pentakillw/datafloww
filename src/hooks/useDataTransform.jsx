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
  const { 
    data, columns, actions, 
    originalData, originalColumns,
    updateDataState, updateActionsState, logAction, showToast 
  } = useData();

  // ==========================================
  // 1. MOTOR DE TRANSFORMACIÓN (LÓGICA PURA)
  // ==========================================
  const applyActionLogic = (currentData, currentCols, action) => {
      let newData = [...currentData];
      let newCols = [...currentCols];

      switch (action.type) {
          case 'DROP_COLUMN':
              newData = newData.map(row => { const r = {...row}; delete r[action.col]; return r; });
              newCols = newCols.filter(c => c !== action.col);
              break;
          case 'RENAME':
              newData = newData.map(r => { const nr = {...r}; nr[action.newVal] = nr[action.col]; delete nr[action.col]; return nr; });
              newCols = newCols.map(c => c === action.col ? action.newVal : c);
              break;
          case 'REORDER_COLS':
              newCols = action.newOrder;
              break;
          case 'ADD_INDEX':
              if(!newCols.includes('ID')) newCols = ['ID', ...newCols];
              newData = newData.map((r, i) => ({ 'ID': i+1, ...r }));
              break;
          case 'DROP_TOP_ROWS':
              newData = newData.slice(action.count);
              break;
          case 'SMART_CLEAN':
              newData = newData.map(row => {
                  const newRow = {};
                  Object.keys(row).forEach(key => {
                      let val = row[key];
                      if (typeof val === 'string') { val = val.trim(); if (['null', 'nan', ''].includes(val.toLowerCase())) val = null; }
                      newRow[key] = val;
                  });
                  return newRow;
              }).filter(row => Object.values(row).some(v => v !== null && v !== ''));
              newData = Array.from(new Set(newData.map(r => JSON.stringify(r)))).map(s => JSON.parse(s));
              break;
          case 'DROP_DUPLICATES':
              newData = Array.from(new Set(newData.map(r => JSON.stringify(r)))).map(s => JSON.parse(s));
              break;
          case 'FILL_DOWN': {
              let last = null;
              newData = newData.map(r => { const v = r[action.col]; if(v!==null && v!=='') last = v; return {...r, [action.col]: last}; });
              break;
          }
          case 'FILL_NULLS':
              newData = newData.map(r => ({...r, [action.col]: (r[action.col]===null || r[action.col]==='') ? action.val : r[action.col]}));
              break;
          case 'TRIM':
              newData = newData.map(r => ({...r, [action.col]: safeStr(r[action.col]).trim()}));
              break;
          case 'CASE_CHANGE':
              newData = newData.map(r => {
                  let v = safeStr(r[action.col]);
                  if(action.mode==='upper') v=v.toUpperCase();
                  if(action.mode==='lower') v=v.toLowerCase();
                  if(action.mode==='title') v=v.toLowerCase().replace(/(?:^|\s)\S/g, a=>a.toUpperCase());
                  return {...r, [action.col]: v};
              });
              break;
          case 'SPLIT': {
              const c1 = `${action.col}_1`, c2 = `${action.col}_2`;
              newData = newData.map(r => { const p = safeStr(r[action.col]).split(action.delim); return {...r, [c1]: p[0]||'', [c2]: p.slice(1).join(action.delim)||''}; });
              if(!newCols.includes(c1)) newCols = [...newCols, c1, c2];
              break;
          }
          case 'MERGE_COLS': {
              const nm = `${action.col1}_${action.col2}`;
              newData = newData.map(r => ({...r, [nm]: `${safeStr(r[action.col1])}${action.sep}${safeStr(r[action.col2])}` }));
              if(!newCols.includes(nm)) newCols = [...newCols, nm];
              break;
          }
          case 'SUBSTR': {
             const nsub = `${action.col}_sub`;
             newData = newData.map(r => ({...r, [nsub]: safeStr(r[action.col]).substr(action.start, action.len)}));
             if(!newCols.includes(nsub)) newCols = [...newCols, nsub];
             break;
          }
          case 'ADD_AFFIX':
              newData = newData.map(r => ({ ...r, [action.col]: action.affixType === 'prefix' ? `${action.text}${safeStr(r[action.col])}` : `${safeStr(r[action.col])}${action.text}` }));
              break;
          case 'REGEX': {
             const nreg = `${action.col}_regex`;
             try {
                const re = new RegExp(action.pattern);
                newData = newData.map(r => { const m = safeStr(r[action.col]).match(re); return {...r, [nreg]: m ? m[0] : ''} });
                if(!newCols.includes(nreg)) newCols = [...newCols, nreg];
             } catch { console.warn("Regex invalido en replay"); }
             break;
          }
          case 'FILTER':
              newData = newData.filter(row => {
                  const cell = row[action.col];
                  const sCell = safeStr(cell).toLowerCase();
                  const sVal = safeStr(action.val).toLowerCase();
                  if(action.condition === 'contains') return sCell.includes(sVal);
                  if(action.condition === 'equals') return sCell === sVal;
                  if(action.condition === 'starts_with') return sCell.startsWith(sVal);
                  const nCell = parseFloat(cell), nVal = parseFloat(action.val);
                  if(!isNaN(nCell) && !isNaN(nVal)) {
                      if(action.condition === '>') return nCell > nVal;
                      if(action.condition === '<') return nCell < nVal;
                  }
                  return true;
              });
              break;
          case 'CALC_MATH':
              newData = newData.map(r => {
                  const v1=safeNum(r[action.col1]), v2=safeNum(r[action.col2]);
                  let res=null;
                  if(!isNaN(v1)&&!isNaN(v2)){
                      if(action.op==='+') res=v1+v2; if(action.op==='-') res=v1-v2;
                      if(action.op==='*') res=v1*v2; if(action.op==='/') res=v2!==0?v1/v2:0;
                  }
                  return {...r, [action.target]: res};
              });
              if(!newCols.includes(action.target)) newCols=[...newCols, action.target];
              break;
          case 'ADD_DAYS': {
              const d = parseInt(action.days)||0;
              newData = newData.map(r => {
                  const dt = new Date(r[action.col]);
                  if(isValidDate(dt)) { dt.setDate(dt.getDate() + d); return {...r, [action.col]: dt.toISOString().split('T')[0]}; }
                  return r;
              });
              break;
          }
          case 'DATE_PART': {
              const ncDate = `${action.col}_${action.part}`;
              newData = newData.map(r => {
                 const dt = new Date(r[action.col]);
                 let res = null;
                 if(isValidDate(dt)){
                    if(action.part==='year') res = dt.getFullYear();
                    if(action.part==='month') res = dt.getMonth()+1;
                 }
                 return {...r, [ncDate]: res};
              });
              if(!newCols.includes(ncDate)) newCols=[...newCols, ncDate];
              break;
          }
          case 'SORT':
              newData.sort((a,b) => a[action.col] > b[action.col] ? (action.dir==='asc'?1:-1) : (action.dir==='asc'?-1:1));
              break;
          case 'FROM_EXAMPLES':
              if (action.rule) {
                  // AHORA PASAMOS EL ÍNDICE (i) A applyRuleToRow
                  newData = newData.map((row, i) => ({ ...row, [action.newCol]: applyRuleToRow(row, action.rule, i) }));
                  if(!newCols.includes(action.newCol)) newCols = [...newCols, action.newCol];
              }
              break;
          default:
              console.warn("Acción no soportada en replay:", action.type);
      }
      return { data: newData, columns: newCols };
  };

  // ==========================================
  // 2. FUNCIÓN PARA APLICAR LOTE DE ACCIONES
  // ==========================================
  const applyBatchTransform = (initialData, initialCols, actionsToApply) => {
      let currentData = [...initialData];
      let currentCols = [...initialCols];

      try {
          actionsToApply.forEach(action => {
              const res = applyActionLogic(currentData, currentCols, action);
              currentData = res.data;
              currentCols = res.columns;
          });
          return { data: currentData, columns: currentCols };
      } catch (err) {
          console.error("Error aplicando batch:", err);
          return { data: initialData, columns: initialCols }; 
      }
  };

  const deleteActionFromHistory = (indexToDelete) => {
      if (!originalData || originalData.length === 0) {
          showToast('No se puede recalcular: Faltan datos originales. Recarga el archivo.', 'error');
          return;
      }
      const newActions = actions.filter((_, idx) => idx !== indexToDelete);
      
      const res = applyBatchTransform(originalData, originalColumns, newActions);
      
      updateDataState(res.data, res.columns);
      updateActionsState(newActions); 
      showToast('Tabla recalculada.', 'success');
  };

  // ==========================================
  // 4. MOTOR INTELIGENTE AVANZADO (PRO)
  // ==========================================
  
  const applyRuleToRow = (row, rule, index) => {
      if (!rule) return '';
      try {
          // --- REGLAS MATEMÁTICAS ---
          if (rule.type.startsWith('math_')) {
              const nCol1 = safeNum(row[rule.col1]);
              
              if (rule.type === 'math_col_op') {
                  const nCol2 = safeNum(row[rule.col2]);
                  if (isNaN(nCol1) || isNaN(nCol2)) return null;
                  if (rule.op === '+') return nCol1 + nCol2;
                  if (rule.op === '-') return nCol1 - nCol2;
                  if (rule.op === '*') return nCol1 * nCol2;
                  if (rule.op === '/') return nCol2 !== 0 ? nCol1 / nCol2 : 0;
              }
              
              if (rule.type === 'math_const_op') {
                  if (isNaN(nCol1)) return null;
                  if (rule.op === '+') return nCol1 + rule.val;
                  if (rule.op === '-') return nCol1 - rule.val;
                  if (rule.op === '*') return nCol1 * rule.val;
                  if (rule.op === '/') return rule.val !== 0 ? nCol1 / rule.val : 0;
              }
          }

          // --- REGLAS DE SÍNTESIS DE TEXTO ---
          if (rule.type === 'static_value') return rule.value;
          
          if (rule.type === 'append_index') {
              const val = safeStr(row[rule.col]);
              return val + (index + 1);
          }
          if (rule.type === 'static_prefix') {
              const val = safeStr(row[rule.col]);
              return rule.prefix + val;
          }
          if (rule.type === 'static_suffix') {
              const val = safeStr(row[rule.col]);
              return val + rule.suffix;
          }
          if (rule.type === 'concat_cols') {
              const v1 = safeStr(row[rule.col1]);
              const v2 = safeStr(row[rule.col2]);
              return v1 + rule.sep + v2;
          }

          // Reglas Clásicas
          const val = safeStr(row[rule.col]);
          switch(rule.type) {
              case 'copy': return val;
              case 'upper': return val.toUpperCase();
              case 'lower': return val.toLowerCase();
              case 'title': return val.toLowerCase().replace(/(?:^|\s)\S/g, a=>a.toUpperCase());
              case 'trim': return val.trim();
              case 'word_extract': {
                  const words = val.trim().split(/[\s,;]+/); 
                  return words[rule.index] || '';
              }
              case 'split_part': {
                  const parts = val.split(rule.delim);
                  return parts[rule.index] || '';
              }
              case 'regex_extract': {
                  const re = new RegExp(rule.pattern);
                  const m = val.match(re);
                  return m ? m[0] : '';
              }
              case 'substr_start': return val.substring(0, rule.len);
              case 'extract_email': {
                  const emailMatch = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                  return emailMatch ? emailMatch[0] : '';
              }
              case 'extract_between': {
                  const s = safeStr(row[rule.col]);
                  const i1 = s.indexOf(rule.start);
                  if (i1 === -1) return '';
                  const i2 = s.indexOf(rule.end, i1 + rule.start.length);
                  if (i2 === -1) return '';
                  return s.substring(i1 + rule.start.length, i2);
              }
              case 'split_reorder': {
                   const parts = safeStr(row[rule.col]).split(rule.delim);
                   const newParts = rule.indices.map(i => parts[i] || '');
                   return newParts.join(rule.outSep);
              }
              case 'date_reformat': {
                  const d = new Date(row[rule.col]);
                  if (!isValidDate(d)) return '';
                  if (rule.format === 'iso') return d.toISOString().split('T')[0]; // YYYY-MM-DD
                  if (rule.format === 'us') return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`; // MM/DD/YYYY
                  if (rule.format === 'eu') return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; // DD/MM/YYYY
                  if (rule.format === 'year') return String(d.getFullYear());
                  if (rule.format === 'month_name') return d.toLocaleString('default', { month: 'long' });
                  return d.toDateString();
              }
              default: return '';
          }
      } catch { return ''; }
  };

  const inferTransformation = (sourceData, examplesMap, limitToCols = null) => {
    const exampleIndices = Object.keys(examplesMap).map(Number).sort((a,b) => a-b);
    if (exampleIndices.length === 0) return null;

    // Usamos hasta 3 ejemplos para inferencia (más robusto)
    const idx1 = exampleIndices[0];
    const row1 = sourceData[idx1];
    const target1 = examplesMap[idx1]; 
    
    const idx2 = exampleIndices.length > 1 ? exampleIndices[1] : null;
    const row2 = idx2 !== null ? sourceData[idx2] : null;
    const target2 = idx2 !== null ? examplesMap[idx2] : null;

    if (target1 === undefined || !row1) return null;

    const colsToScan = limitToCols || Object.keys(row1);
    const candidates = [];

    // Detectar si el objetivo es numérico
    const isNumTarget = !isNaN(parseFloat(target1));

    // ---------------------------------------------------------
    // 1. INFERENCIA MATEMÁTICA
    // ---------------------------------------------------------
    if (isNumTarget) {
        const t1 = parseFloat(target1);
        const t2 = target2 !== null ? parseFloat(target2) : null;

        colsToScan.forEach(colA => {
            const vA1 = parseFloat(row1[colA]);
            if (isNaN(vA1)) return;
            const vA2 = row2 ? parseFloat(row2[colA]) : null;

            // ... (Lógica matemática existente simplificada/mantenida) ...
            // Operaciones con Constante
            const diff1 = t1 - vA1;
            if (!row2 || Math.abs((t2 - vA2) - diff1) < 0.001) {
                 candidates.push({ type: 'math_const_op', op: '+', col1: colA, val: diff1, description: `[${colA}] + ${diff1}` });
            }
            if (vA1 !== 0) {
                const factor1 = t1 / vA1;
                if (!row2 || (vA2 !== 0 && Math.abs((t2 / vA2) - factor1) < 0.001)) {
                     candidates.push({ type: 'math_const_op', op: '*', col1: colA, val: factor1, description: `[${colA}] * ${factor1.toFixed(2)}` });
                }
            }

            // Operaciones entre Columnas
            colsToScan.forEach(colB => {
                if (colA === colB) return;
                const vB1 = parseFloat(row1[colB]);
                if (isNaN(vB1)) return;
                const vB2 = row2 ? parseFloat(row2[colB]) : null;

                if (Math.abs((vA1 + vB1) - t1) < 0.001 && (!row2 || Math.abs((vA2 + vB2) - t2) < 0.001))
                    candidates.push({ type: 'math_col_op', op: '+', col1: colA, col2: colB, description: `[${colA}] + [${colB}]` });
                if (Math.abs((vA1 * vB1) - t1) < 0.001 && (!row2 || Math.abs((vA2 * vB2) - t2) < 0.001))
                    candidates.push({ type: 'math_col_op', op: '*', col1: colA, col2: colB, description: `[${colA}] * [${colB}]` });
            });
        });
    }

    // ---------------------------------------------------------
    // 2. INFERENCIA DE TEXTO Y ESTRUCTURA
    // ---------------------------------------------------------
    const sT1 = safeStr(target1);
    const sT2 = target2 !== null ? safeStr(target2) : null;

    // A. Constante
    const allSame = exampleIndices.every(idx => safeStr(examplesMap[idx]) === sT1);
    if (allSame) candidates.push({ type: 'static_value', value: sT1, description: `Valor Constante: "${sT1}"` });

    colsToScan.forEach(col => {
        const val1 = safeStr(row1[col]);
        if (!val1) return;

        // B. Concatenación con Índice
        if (sT1 === val1 + (idx1 + 1) && (!row2 || sT2 === safeStr(row2[col]) + (idx2 + 1)))
             candidates.push({ type: 'append_index', col, description: `[${col}] + N° Fila` });

        // C. Prefijo/Sufijo
        if (sT1.endsWith(val1) && sT1.length > val1.length) {
            const prefix = sT1.substring(0, sT1.length - val1.length);
            if (!row2 || sT2 === prefix + safeStr(row2[col]))
                candidates.push({ type: 'static_prefix', col, prefix, description: `"${prefix}" + [${col}]` });
        }
        if (sT1.startsWith(val1) && sT1.length > val1.length) {
            const suffix = sT1.substring(val1.length);
            if (!row2 || sT2 === safeStr(row2[col]) + suffix)
                candidates.push({ type: 'static_suffix', col, suffix, description: `[${col}] + "${suffix}"` });
        }

        // D. Combinación de Columnas
        colsToScan.forEach(colB => {
            if (col === colB) return;
            const valB1 = safeStr(row1[colB]);
            if (!valB1) return;
            if (sT1.startsWith(val1) && sT1.endsWith(valB1)) {
                const sep = sT1.substring(val1.length, sT1.length - valB1.length);
                if (!row2 || sT2 === safeStr(row2[col]) + sep + safeStr(row2[colB]))
                    candidates.push({ type: 'concat_cols', col1: col, col2: colB, sep, description: `[${col}] + "${sep}" + [${colB}]` });
            }
        });

        // E. Transformaciones Básicas
        if (val1 === sT1) candidates.push({ type: 'copy', col, description: `Copia de [${col}]` });
        if (val1.toUpperCase() === sT1) candidates.push({ type: 'upper', col, description: `Mayúsculas de [${col}]` });
        if (val1.toLowerCase() === sT1) candidates.push({ type: 'lower', col, description: `Minúsculas de [${col}]` });
        if (val1.trim() === sT1) candidates.push({ type: 'trim', col, description: `Trim [${col}]` });

        // F. SPLIT & PARTES
        const delimiters = [' ', '-', '_', ',', '.', '/', '|', ':', ';', '@'];
        delimiters.forEach(delim => {
            if (val1.includes(delim)) {
                const parts = val1.split(delim);
                
                // Parte Simple
                const partIdx = parts.indexOf(sT1);
                if (partIdx !== -1) {
                    if (!row2 || (safeStr(row2[col]).split(delim)[partIdx] === sT2)) {
                        candidates.push({ type: 'split_part', col, delim, index: partIdx, description: `Extraer parte ${partIdx+1} (Sep: '${delim}')` });
                    }
                }
                
                // Reordenamiento (Ej: "Doe, John" -> "John Doe")
                // Intentamos reconstruir el Target usando partes del Source
                if (parts.length > 1) {
                    // Generar todas las combinaciones de índices es costoso, probamos inversión simple o reorden
                    // Heurística: Chequear si todas las palabras del target están en el source
                    const targetParts = sT1.split(/[\s,.-]+/); // Separador de salida genérico
                    const mappedIndices = targetParts.map(tp => parts.indexOf(tp));
                    
                    if (!mappedIndices.includes(-1) && mappedIndices.length === targetParts.length) {
                         // Encontramos que el target está formado por partes del source
                         // Determinamos el separador de salida (asumimos el primer char no alfanumérico entre palabras)
                         // Para simplificar, asumimos espacio si no se detecta
                         let outSep = " ";
                         if (sT1.includes(" ")) outSep = " ";
                         else if (sT1.includes("-")) outSep = "-";
                         
                         // Validar con row2
                         if (row2) {
                             const parts2 = safeStr(row2[col]).split(delim);
                             const targetParts2 = mappedIndices.map(i => parts2[i]).join(outSep);
                             if (targetParts2 === sT2) {
                                 candidates.push({ 
                                     type: 'split_reorder', col, delim, outSep, indices: mappedIndices, 
                                     description: `Reordenar partes (Sep: '${delim}')` 
                                 });
                             }
                         } else {
                             candidates.push({ 
                                 type: 'split_reorder', col, delim, outSep, indices: mappedIndices, 
                                 description: `Reordenar partes (Sep: '${delim}')` 
                             });
                         }
                    }
                }
            }
        });

        // G. EXTRAER ENTRE DELIMITADORES
        const brackets = [['(', ')'], ['[', ']'], ['{', '}'], ['<', '>'], ["'", "'"], ['"', '"']];
        brackets.forEach(([start, end]) => {
             const i1 = val1.indexOf(start);
             if (i1 !== -1) {
                 const i2 = val1.indexOf(end, i1 + 1);
                 if (i2 !== -1) {
                     const extracted = val1.substring(i1 + start.length, i2);
                     if (extracted === sT1) {
                         if (!row2 || (safeStr(row2[col]).includes(start) && safeStr(row2[col]).substring(safeStr(row2[col]).indexOf(start)+start.length, safeStr(row2[col]).indexOf(end, safeStr(row2[col]).indexOf(start))) === sT2)) {
                             candidates.push({ type: 'extract_between', col, start, end, description: `Extraer entre ${start} y ${end}` });
                         }
                     }
                 }
             }
        });

        // H. FECHAS
        const d1 = new Date(val1);
        if (isValidDate(d1)) {
             // Chequear formatos comunes de salida
             const iso = d1.toISOString().split('T')[0];
             const us = `${d1.getMonth()+1}/${d1.getDate()}/${d1.getFullYear()}`;
             const eu = `${d1.getDate()}/${d1.getMonth()+1}/${d1.getFullYear()}`;
             const year = String(d1.getFullYear());
             
             if (sT1 === iso && (!row2 || sT2 === new Date(row2[col]).toISOString().split('T')[0]))
                 candidates.push({ type: 'date_reformat', col, format: 'iso', description: 'Formato ISO (YYYY-MM-DD)' });
             else if (sT1 === us && (!row2 || sT2 === `${new Date(row2[col]).getMonth()+1}/${new Date(row2[col]).getDate()}/${new Date(row2[col]).getFullYear()}`))
                 candidates.push({ type: 'date_reformat', col, format: 'us', description: 'Formato US (MM/DD/YYYY)' });
             else if (sT1 === eu && (!row2 || sT2 === `${new Date(row2[col]).getDate()}/${new Date(row2[col]).getMonth()+1}/${new Date(row2[col]).getFullYear()}`))
                 candidates.push({ type: 'date_reformat', col, format: 'eu', description: 'Formato EU (DD/MM/YYYY)' });
             else if (sT1 === year)
                 candidates.push({ type: 'date_reformat', col, format: 'year', description: 'Extraer Año' });
        }

        // I. REGEX COMMON PATTERNS (Mejorado)
        const patterns = [
            { name: 'Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
            { name: 'URL', regex: /https?:\/\/[^\s]+/ },
            { name: 'Dominio', regex: /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
            { name: 'Teléfono', regex: /\+?\d[\d -]{8,}\d/ },
            { name: 'Moneda', regex: /\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/ },
            { name: 'Número', regex: /\d+/ },
            { name: 'Palabra (Primera)', regex: /^\w+/ },
            { name: 'Palabra (Última)', regex: /\w+$/ }
        ];
        
        patterns.forEach(pat => {
            const m1 = val1.match(pat.regex);
            if (m1 && m1[0] === sT1) {
                 if (!row2 || (safeStr(row2[col]).match(pat.regex) || [])[0] === sT2) {
                     candidates.push({ type: 'regex_extract', col, pattern: pat.regex.source, description: `Extraer ${pat.name}` });
                 }
            }
        });
    });

    // --- SELECCIÓN DEL MEJOR CANDIDATO ---
    // Buscamos la primera regla que cumpla TODOS los ejemplos dados por el usuario
    const validRule = candidates.find(rule => {
        return exampleIndices.every(idx => {
            const row = sourceData[idx];
            const target = examplesMap[idx]; 
            if (!row) return false;
            
            let prediction = applyRuleToRow(row, rule, idx);
            // Normalización para comparación
            if (typeof prediction === 'number' && typeof target === 'string') prediction = String(prediction);
            if (typeof target === 'number' && typeof prediction === 'string') prediction = parseFloat(prediction);

            return prediction == target; 
        });
    });

    return validRule || null;
  };

  // --- UI WRAPPERS (Passthrough) ---
  const promoteHeaders = () => { if (data.length < 1) return; const newHeaders = columns.map(c => safeStr(data[0][c]).trim() || c); const newData = data.slice(1).map(r => { const nr = {}; columns.forEach((old, i) => nr[newHeaders[i]] = r[old]); return nr; }); updateDataState(newData, newHeaders); logAction({ type: 'PROMOTE_HEADER', description: 'Promover encabezados' }); };
  const applyFilter = (col, condition, val) => { const action = { type: 'FILTER', col, condition, val }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Filtro ${col} ${condition} ${val}` }); };
  const smartClean = () => { const action = { type: 'SMART_CLEAN' }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: 'Smart Clean' }); };
  const dropColumn = (col) => { const action = { type: 'DROP_COLUMN', col }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Eliminar ${col}` }); };
  const renameColumn = (col, newVal) => { const action = { type: 'RENAME', col, newVal }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Renombrar ${col} -> ${newVal}` }); };
  const trimText = (col) => { const action = { type: 'TRIM', col }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Trim ${col}` }); };
  const fillDown = (col) => { const action = { type: 'FILL_DOWN', col }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Fill Down ${col}` }); };
  const cleanSymbols = (col) => { const action = { type: 'CLEAN_SYMBOLS', col }; const newData = data.map(r => ({...r, [col]: safeStr(r[col]).replace(/[^a-zA-Z0-9\s]/g, '') })); updateDataState(newData, columns); logAction({ ...action, description: `Limpiar símbolos ${col}` }); };
  const removeDuplicates = () => { const action = { type: 'DROP_DUPLICATES' }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: 'Eliminar duplicados' }); };
  const changeType = (col, to) => { const action = { type: 'CHANGE_TYPE', col, to }; const newData = data.map(r => { let v = r[col]; if (to === 'numeric') v = safeNum(v); else if (to === 'string') v = safeStr(v); else if (to === 'date') { const d = new Date(v); v = isValidDate(d) ? d.toISOString().split('T')[0] : null; } return { ...r, [col]: v }; }); updateDataState(newData, columns); logAction({ ...action, description: `Cambiar tipo ${col} a ${to}` }); };
  const addIndexColumn = () => { const action = { type: 'ADD_INDEX' }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: 'Agregar Índice' }); };
  const fillNullsVar = (col, val) => { const action = { type: 'FILL_NULLS', col, val }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Rellenar ${col}` }); };
  const imputeNulls = (col, method) => logAction({ type: 'IMPUTE', col, method, description: `Imputar ${method}` }); 
  const replaceValues = (col, find, replace) => logAction({ type: 'REPLACE', col, find, replace });
  const splitColumn = (col, delim) => { const action = { type: 'SPLIT', col, delim }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Dividir ${col}` }); };
  const mergeColumns = (col1, col2, sep) => { const action = { type: 'MERGE_COLS', col1, col2, sep }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Unir ${col1}+${col2}` }); };
  const addAffix = (col, text, affixType) => { const action = { type: 'ADD_AFFIX', col, text, affixType }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Agregar ${affixType}` }); };
  const textSubstring = (col, start, len) => { const action = { type: 'SUBSTR', col, start: parseInt(start), len: parseInt(len) }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Substr ${col}` }); };
  const applyRegexExtract = (col, pattern) => { const action = { type: 'REGEX', col, pattern }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Regex ${col}` }); };
  const applyMath = (col1, col2, op, target) => { const action = { type: 'CALC_MATH', col1, col2, op, target }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Calc ${target}` }); };
  const addDaysToDate = (col, days) => { const action = { type: 'ADD_DAYS', col, days }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Sumar dias ${col}` }); };
  const extractDatePart = (col, part) => { const action = { type: 'DATE_PART', col, part }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Extraer ${part}` }); };
  const maskData = (col, chars) => logAction({ type: 'MASK', col, chars });
  const applyPadStart = (col, len, char) => logAction({ type: 'PAD', col, len, char });
  const extractJson = (col, key) => logAction({ type: 'JSON', col, key });
  const clipValues = (col, min, max) => logAction({ type: 'CLIP', col, min, max });
  const applyRound = (col, dec) => logAction({ type: 'ROUND', col, dec });
  const applyGroup = (col, agg, op) => logAction({ type: 'GROUP', col, agg, op });
  const handleCase = (col, mode) => { const action = { type: 'CASE_CHANGE', col, mode }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction({ ...action, description: `Case ${mode}` }); };
  const duplicateColumn = (col) => logAction({ type: 'DUP_COL', col });
  const reorderColumns = (from, to) => { const newOrder = [...columns]; const [moved] = newOrder.splice(from, 1); newOrder.splice(to, 0, moved); const action = { type: 'REORDER_COLS', newOrder }; updateDataState(data, newOrder); logAction(action); };
  const removeTopRows = (n) => { const action = { type: 'DROP_TOP_ROWS', count: n }; const res = applyActionLogic(data, columns, action); updateDataState(res.data, res.columns); logAction(action); };
  const addCustomColumn = (name, formula) => logAction({ type: 'CUSTOM', name, formula });
  const addConditionalColumn = (name) => logAction({ type: 'COND', name });
  const applyZScore = (col) => logAction({ type: 'ZSCORE', col });
  const applyMinMax = (col) => logAction({ type: 'MINMAX', col });
  const applyOneHotEncoding = (col) => logAction({ type: 'ONEHOT', col });
  const sortData = (col, dir) => { const sorted = [...data].sort((a,b) => a[col] > b[col] ? (dir==='asc'?1:-1) : (dir==='asc'?-1:1)); updateDataState(sorted, columns); logAction({ type: 'SORT', col, dir }); };
  
  const generateColumnFromExamples = (newColName, examplesMap) => { 
      const rule = inferTransformation(data, examplesMap); 
      if (!rule) { showToast('No se pudo confirmar el patrón.', 'error'); return; } 
      const newData = data.map((row, i) => ({ ...row, [newColName]: applyRuleToRow(row, rule, i) })); 
      updateDataState(newData, [...columns, newColName]); 
      logAction({ type: 'FROM_EXAMPLES', newCol: newColName, rule: rule, description: `Columna Inteligente: ${newColName} (${rule.description || rule.type})` }); 
  };

  return {
    deleteActionFromHistory,
    applyBatchTransform,
    promoteHeaders, smartClean, applyFilter, dropColumn, renameColumn, trimText, fillDown, cleanSymbols,
    removeDuplicates, changeType, addIndexColumn, fillNullsVar, imputeNulls, replaceValues, splitColumn, mergeColumns,
    addAffix, textSubstring, applyRegexExtract, maskData, applyPadStart, extractJson, addDaysToDate, extractDatePart, applyMath, clipValues,
    applyRound, applyGroup, handleCase, duplicateColumn, reorderColumns, removeTopRows, addCustomColumn, addConditionalColumn, applyZScore,
    applyMinMax, applyOneHotEncoding, sortData, inferTransformation, applyRuleToRow, generateColumnFromExamples
  };
}