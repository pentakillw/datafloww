// src/utils/transformEngine.js

// --- HELPERS DE SEGURIDAD ---
const safeStr = (val) => (val === null || val === undefined) ? '' : String(val);
const safeNum = (val) => {
  if (val === null || val === undefined || val === '') return NaN;
  const n = parseFloat(val);
  return isFinite(n) ? n : NaN;
};
const isValidDate = (d) => d instanceof Date && !isNaN(d);

export const applyRuleToRow = (row, rule, index) => {
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

export const applyActionLogic = (currentData, currentCols, action) => {
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
        case 'DUP_COL': {
            const newName = `${action.col} - Copy`;
            let uniqueName = newName;
            let counter = 1;
            while (newCols.includes(uniqueName)) {
                uniqueName = `${newName} (${counter})`;
                counter++;
            }
            newData = newData.map(r => ({ ...r, [uniqueName]: r[action.col] }));
            // Insertar justo después de la original
            const idx = newCols.indexOf(action.col);
            newCols.splice(idx + 1, 0, uniqueName);
            break;
        }
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
        case 'NORMALIZE_SPACES':
            newData = newData.map(r => ({...r, [action.col]: safeStr(r[action.col]).replace(/\s+/g, ' ').trim()}));
            break;
        case 'REMOVE_HTML':
            newData = newData.map(r => ({...r, [action.col]: safeStr(r[action.col]).replace(/<[^>]*>?/gm, '')}));
            break;
        case 'REMOVE_NON_NUMERIC':
            newData = newData.map(r => ({...r, [action.col]: safeStr(r[action.col]).replace(/[^0-9.]/g, '')}));
            break;
        case 'REMOVE_NON_ALPHA':
            newData = newData.map(r => ({...r, [action.col]: safeStr(r[action.col]).replace(/[^a-zA-Z]/g, '')}));
            break;
        case 'TEXT_LENGTH': {
            const nlen = `${action.col}_len`;
            newData = newData.map(r => ({...r, [nlen]: safeStr(r[action.col]).length}));
            if(!newCols.includes(nlen)) newCols = [...newCols, nlen];
            break;
        }
        case 'TEXT_REVERSE':
            newData = newData.map(r => ({...r, [action.col]: safeStr(r[action.col]).split('').reverse().join('')}));
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
                
                // --- NUEVA LÓGICA PARA LISTAS (IN) ---
                if (action.condition === 'in') {
                    // action.val es un array de valores permitidos (strings)
                    // Normalizamos el valor de la celda para coincidir con lo que muestra el filtro
                    const cellStr = (cell === null || cell === undefined) ? '(Vacío)' : String(cell);
                    return action.val.includes(cellStr);
                }
                // -------------------------------------

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
        case 'CALC_ADVANCED': {
            const nadv = `${action.col}_${action.func.toLowerCase()}`;
            newData = newData.map(r => {
                const v = safeNum(r[action.col]);
                let res = null;
                if (!isNaN(v)) {
                    if (action.func === 'ABS') res = Math.abs(v);
                    if (action.func === 'FLOOR') res = Math.floor(v);
                    if (action.func === 'CEIL') res = Math.ceil(v);
                    if (action.func === 'SQRT') res = v >= 0 ? Math.sqrt(v) : null;
                    if (action.func === 'LOG') res = v > 0 ? Math.log(v) : null;
                    if (action.func === 'POWER') res = Math.pow(v, action.val || 2);
                    if (action.func === 'MOD') res = v % (action.val || 2);
                }
                return { ...r, [nadv]: res };
            });
            if (!newCols.includes(nadv)) newCols = [...newCols, nadv];
            break;
        }
        case 'ADD_DAYS': {
            const d = parseInt(action.days)||0;
            newData = newData.map(r => {
                const dt = new Date(r[action.col]);
                if(isValidDate(dt)) { dt.setDate(dt.getDate() + d); return {...r, [action.col]: dt.toISOString().split('T')[0]}; }
                return r;
            });
            break;
        }
        case 'ADD_MONTHS': {
            const m = parseInt(action.months)||0;
            newData = newData.map(r => {
                const dt = new Date(r[action.col]);
                if(isValidDate(dt)) { dt.setMonth(dt.getMonth() + m); return {...r, [action.col]: dt.toISOString().split('T')[0]}; }
                return r;
            });
            break;
        }
        case 'GET_DAY_OF_WEEK': {
            const ndow = `${action.col}_dow`;
            const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
            newData = newData.map(r => {
                const dt = new Date(r[action.col]);
                return {...r, [ndow]: isValidDate(dt) ? days[dt.getDay()] : ''};
            });
            if(!newCols.includes(ndow)) newCols = [...newCols, ndow];
            break;
        }
        case 'GET_QUARTER': {
            const nq = `${action.col}_quarter`;
            newData = newData.map(r => {
                const dt = new Date(r[action.col]);
                return {...r, [nq]: isValidDate(dt) ? Math.ceil((dt.getMonth() + 1) / 3) : ''};
            });
            if(!newCols.includes(nq)) newCols = [...newCols, nq];
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

export const applyBatchTransform = (initialData, initialCols, actionsToApply) => {
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
