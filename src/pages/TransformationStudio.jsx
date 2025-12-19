import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useDataTransform } from '../hooks/useDataTransform.jsx';
import ColumnFilter from '../components/ColumnFilter';
import { useI18n } from '../i18n/i18n.jsx';
import { 
  Filter, Trash2, ArrowDownAZ, Eraser, 
  Type, Undo2, History, XCircle, Search,
  Calculator, Sigma, Edit3, Replace, Scissors,
  ArrowUp, TableProperties, ChevronDown, Sparkles,
  Calendar, GitFork, Divide, LayoutList,
  Combine, Split, Baseline, ListOrdered, Hash, CaseUpper, FunctionSquare,
  Code, Binary, CalendarPlus, CalendarRange, 
  ArrowRightToLine, ArrowDownToLine, EyeOff, Scaling, 
  Shuffle, Braces, Info, Minimize2, Maximize2, X,
  ArrowRightLeft, BrainCircuit, BarChart4, TrendingUp, MoreVertical,
  ArrowUpAZ, Copy, ArrowLeft, ArrowRight, GripVertical,
  PlusSquare, Zap, PlayCircle, Wand2, CheckCircle2, ScanSearch, MousePointerClick
} from 'lucide-react';

export default function TransformationStudio() {
  const { data, columns, actions, undoLastAction, showToast, originalData, originalColumns } = useData();
  const transform = useDataTransform(); 
  const { t } = useI18n();
  
  const [activeCol, setActiveCol] = useState(null);
  
  // --- ESTADOS DE LA INTERFAZ ---
  const [historyOpen, setHistoryOpen] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); 
  
  // MENÚ DE COLUMNA FLOTANTE
  const [headerMenuOpen, setHeaderMenuOpen] = useState(null);
  const [headerMenuPos, setHeaderMenuPos] = useState({ top: 0, left: 0 });
  
  // DRAG & DROP
  const [draggedColIdx, setDraggedColIdx] = useState(null); 
  const [dropTargetIdx, setDropTargetIdx] = useState(null); 
  
  const menuRef = useRef(null);

  const [activeModal, setActiveModal] = useState(null); 
  const [colStats, setColStats] = useState(null);

  // --- VARIABLES DE ESTADO ---
  const [newName, setNewName] = useState('');
  const [fillValue, setFillValue] = useState('0');
  const [rowsToRemove, setRowsToRemove] = useState(1);
  const [targetType, setTargetType] = useState('numeric');
  const [imputeMethod, setImputeMethod] = useState('mean');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [affixText, setAffixText] = useState('');
  const [affixType, setAffixType] = useState('prefix');
  const [regexPattern, setRegexPattern] = useState('[A-Za-z]+');
  const [maskChars, setMaskChars] = useState('4');
  const [padLen, setPadLen] = useState('5');
  const [padChar, setPadChar] = useState('0');
  const [jsonKey, setJsonKey] = useState('');
  const [splitDelim, setSplitDelim] = useState(',');
  const [mergeCol2, setMergeCol2] = useState('');
  const [mergeSep, setMergeSep] = useState(' '); 
  const [subStart, setSubStart] = useState('0');
  const [subLen, setSubLen] = useState('5');
  const [mathTarget, setMathTarget] = useState('Total');
  const [mathOp, setMathOp] = useState('*');
  const [mathCol2, setMathCol2] = useState('');
  const [roundDecimals, setRoundDecimals] = useState('2');
  const [clipMin, setClipMin] = useState('0');
  const [clipMax, setClipMax] = useState('100');
  const [groupAggCol, setGroupAggCol] = useState(''); 
  const [groupOp, setGroupOp] = useState('SUM');
  const [addDaysVal, setAddDaysVal] = useState('30');
  const [addMonthsVal, setAddMonthsVal] = useState('1');
  const [calcVal, setCalcVal] = useState('2');
  
  // -- VIRTUALIZACIÓN / INFINITE SCROLL --
  const [visibleRows, setVisibleRows] = useState(100);
  const scrollContainerRef = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Si estamos cerca del final (200px), cargamos más
    if (scrollHeight - scrollTop - clientHeight < 200) {
        if (visibleRows < data.length) {
            setVisibleRows(prev => Math.min(prev + 100, data.length));
        }
    }
  };

  // -- FILTROS --
  const [filterCondition, setFilterCondition] = useState('contains');
  const [filterValue, setFilterValue] = useState('');

  // -- MODALES AVANZADOS --
  const [customColName, setCustomColName] = useState('Personalizada');
  const [customFormula, setCustomFormula] = useState('');
  const [condRules, setCondRules] = useState([]); 
  const [condElse, setCondElse] = useState('');

  // -- MODAL: COLUMNA POR EJEMPLOS --
  const [exampleMap, setExampleMap] = useState({}); 
  const [previewExampleCol, setPreviewExampleCol] = useState({}); 
  const [inferredRule, setInferredRule] = useState(null);
  const [scanScope, setScanScope] = useState('all'); 

  useEffect(() => {
    if (columns.length > 0) {
      const first = columns[0];
      if (!mathCol2) setMathCol2(first);
      if (!mergeCol2) setMergeCol2(first);
      if (!groupAggCol) setGroupAggCol(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // Clicks fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
      if (headerMenuOpen && !event.target.closest('.floating-menu-container') && !event.target.closest('.header-trigger')) {
        setHeaderMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [headerMenuOpen]);

  const uniqueValuesForFilter = useMemo(() => {
    const targetCol = headerMenuOpen || (activeModal === 'filter' ? activeCol : null);
    if (!targetCol || !originalData || originalData.length === 0) return null;
    const actionsExcludingTarget = actions.filter(a => !(a.type === 'FILTER' && a.col === targetCol));
    try {
      const { data: previewData } = transform.applyBatchTransform(originalData, originalColumns, actionsExcludingTarget);
      return previewData.map(r => r[targetCol]);
    } catch {
      return null;
    }
  }, [headerMenuOpen, activeModal, activeCol, actions, originalData, originalColumns, transform]);

  const adRefStudio = useRef(null);
  useEffect(() => {
    const container = adRefStudio.current;
    if (!container) return;
    container.innerHTML = '';
    const opt = document.createElement('script');
    opt.type = 'text/javascript';
    opt.text = `
      atOptions = {
        'key' : '86c2bc3cb29c267c15f0d20e0ea69b8e',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/86c2bc3cb29c267c15f0d20e0ea69b8e/invoke.js';
    script.async = true;
    container.appendChild(opt);
    container.appendChild(script);
    return () => { if (container) container.innerHTML = ''; };
  }, []);
  const closeModal = () => {
    setActiveModal(null);
    setFindText(''); setReplaceText(''); setAffixText(''); setFilterValue('');
    setCustomColName('Personalizada'); setCustomFormula('');
    setCondRules([]); setCondElse('');
    setExampleMap({}); setPreviewExampleCol({}); setInferredRule(null); setScanScope('all');
  };
  
  const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

  const toggleHeaderMenu = (col, e) => {
    e.stopPropagation();
    if (headerMenuOpen === col) {
      setHeaderMenuOpen(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      let leftPos = rect.left;
      if (leftPos + 200 > screenWidth) leftPos = rect.right - 200;
      setHeaderMenuPos({ top: rect.bottom + 5, left: leftPos });
      setActiveCol(col); 
      setHeaderMenuOpen(col);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedColIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
    setTimeout(() => { if(e.target) e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e) => {
    if(e.target) e.target.style.opacity = '1';
    setDraggedColIdx(null);
    setDropTargetIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
    if (draggedColIdx !== index) {
        setDropTargetIdx(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedColIdx === null) return;
    transform.reorderColumns(draggedColIdx, targetIndex);
    setDropTargetIdx(null);
  };

  const showColumnStats = () => {
    if (!activeCol) return showToast(t('studio.selectColumn'), 'warning');
    const vals = data.map(r => r[activeCol]);
    const numVals = vals.map(v => parseFloat(v)).filter(v => !isNaN(v) && isFinite(v));
    const notNulls = vals.filter(v => v !== null && v !== '');
    
    setColStats({ 
      colName: activeCol, 
      total: vals.length, 
      filled: notNulls.length, 
      empty: vals.length - notNulls.length, 
      unique: new Set(vals).size, 
      min: numVals.length ? Math.min(...numVals) : '-', 
      max: numVals.length ? Math.max(...numVals) : '-', 
      avg: numVals.length ? (numVals.reduce((a,b) => a + b, 0) / numVals.length).toFixed(2) : '-' 
    });
    setActiveModal('stats'); 
    setOpenMenu(null);
    setHeaderMenuOpen(null);
  };

  const addCondRule = () => setCondRules([...condRules, { col: columns[0], op: 'equals', val: '', output: '' }]);
  const updateCondRule = (idx, field, val) => { const n = [...condRules]; n[idx][field] = val; setCondRules(n); };
  const removeCondRule = (idx) => setCondRules(condRules.filter((_, i) => i !== idx));

  // --- LÓGICA DE EJEMPLOS ACTUALIZADA ---
  const runExampleInference = (currentMap, scope) => {
      const colsToScan = (scope === 'selection' && activeCol) ? [activeCol] : columns;
      // Invocamos la nueva lógica inteligente
      const rule = transform.inferTransformation(data, currentMap, colsToScan);
      setInferredRule(rule);
      if (rule) {
          const preds = {};
          data.forEach((row, idx) => {
              if (currentMap[idx] !== undefined) return; 
              // IMPORTANTE: Pasamos el índice 'idx' para detectar patrones secuenciales
              preds[idx] = transform.applyRuleToRow(row, rule, idx);
          });
          setPreviewExampleCol(preds);
      } else {
          setPreviewExampleCol({});
      }
  };

  const handleExampleChange = (rowIndex, value) => {
      const newMap = { ...exampleMap, [rowIndex]: value };
      if (!value) delete newMap[rowIndex];
      setExampleMap(newMap);
      runExampleInference(newMap, scanScope);
  };

  const handleScopeChange = (newScope) => {
      setScanScope(newScope);
      runExampleInference(exampleMap, newScope);
  };

  // --- RENDERIZADO CONDICIONAL DE SEGURIDAD ---
  if (!data || data.length === 0 || columns.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-wolf opacity-60 animate-in fade-in">
      <LayoutList size={64} />
      <h2 className="mt-4 text-xl font-bold">{t('studio.noDataTitle')}</h2>
      <p className="text-sm">{t('studio.noDataSubtitle')}</p>
    </div>
  );

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm h-full"> 
        
        {/* NAVBAR PRINCIPAL */}
        <div className="bg-white dark:bg-carbon-light border-b border-gray-200 dark:border-wolf/20 p-2 flex gap-2 items-center relative z-[60] flex-wrap shadow-sm rounded-t-xl select-none" ref={menuRef}>
          
          <DropdownMenu label={t('studio.top.addColumn')} icon={<PlusSquare size={16} className="text-persian" />} isOpen={openMenu === 'add_col'} onClick={() => toggleMenu('add_col')}>
            <DropdownSectionTitle title={t('studio.menu.sections.general')} />
            <DropdownItem icon={<Zap size={14} />} label={t('studio.menu.examplesColumn')} onClick={() => { setActiveModal('examples_col'); setOpenMenu(null); }} />
            <DropdownItem icon={<FunctionSquare size={14} />} label={t('studio.menu.customColumn')} onClick={() => { setActiveModal('custom_col'); setOpenMenu(null); }} />
            <DropdownSectionTitle title={t('studio.menu.sections.conditionalStructure')} />
            <DropdownItem icon={<GitFork size={14} />} label={t('studio.menu.conditionalColumn')} onClick={() => { setActiveModal('conditional_col'); addCondRule(); setOpenMenu(null); }} />
            <DropdownItem icon={<ListOrdered size={14} />} label={t('studio.menu.indexColumn')} onClick={() => { transform.addIndexColumn(); setOpenMenu(null); }} />
            <DropdownItem icon={<Copy size={14} />} label={t('studio.menu.duplicateColumn')} onClick={() => { transform.duplicateColumn(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label={t('studio.top.structure')} icon={<TableProperties size={16} />} isOpen={openMenu === 'structure'} onClick={() => toggleMenu('structure')}>
            <DropdownSectionTitle title={t('studio.menu.sections.table')} />
            <DropdownItem icon={<ArrowUp size={14} />} label={t('studio.menu.promoteHeaders')} onClick={() => { transform.promoteHeaders(); setOpenMenu(null); }} />
            <DropdownItem icon={<Trash2 size={14} />} label={t('studio.menu.removeTopRows')} onClick={() => setActiveModal('dropRows')} danger />
            <DropdownItem icon={<XCircle size={14} />} label={t('studio.menu.dropColumn')} onClick={() => { transform.dropColumn(activeCol); setOpenMenu(null); }} disabled={!activeCol} danger />
            <DropdownSectionTitle title={t('studio.menu.sections.actions')} />
            <DropdownItem icon={<Edit3 size={14} />} label={t('studio.menu.renameColumn')} onClick={() => { setNewName(activeCol); setActiveModal('rename'); }} disabled={!activeCol} />
            <DropdownItem icon={<ArrowRightLeft size={14} />} label={t('studio.menu.changeType')} onClick={() => setActiveModal('type')} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label={t('studio.top.cleaning')} icon={<Wand2 size={16} />} isOpen={openMenu === 'cleaning'} onClick={() => toggleMenu('cleaning')}>
            <DropdownSectionTitle title={t('studio.menu.sections.text')} />
            <DropdownItem icon={<Scissors size={14} />} label={t('studio.menu.trimSpaces')} onClick={() => { transform.trimText(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Type size={14} />} label={t('studio.menu.normalizeSpaces')} onClick={() => { transform.normalizeSpaces(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Binary size={14} />} label={t('studio.menu.cleanSymbols')} onClick={() => { transform.cleanSymbols(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Code size={14} />} label={t('studio.menu.removeHtml')} onClick={() => { transform.removeHtml(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<CaseUpper size={14} />} label={t('studio.menu.titleCase')} onClick={() => { transform.handleCase(activeCol, 'title'); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownSectionTitle title={t('studio.menu.sections.charFilter')} />
            <DropdownItem icon={<Hash size={14} />} label={t('studio.menu.onlyNumbers')} onClick={() => { transform.removeNonNumeric(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Type size={14} />} label={t('studio.menu.onlyLetters')} onClick={() => { transform.removeNonAlpha(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownSectionTitle title={t('studio.menu.sections.values')} />
            <DropdownItem icon={<Trash2 size={14} />} label={t('studio.menu.removeDuplicates')} onClick={() => { transform.removeDuplicates(); setOpenMenu(null); }} />
            <DropdownItem icon={<ArrowDownToLine size={14} />} label={t('studio.menu.fillDown')} onClick={() => { transform.fillDown(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Edit3 size={14} />} label={t('studio.menu.fillNulls')} onClick={() => setActiveModal('fillNulls')} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label={t('studio.top.textDate')} icon={<Type size={16} />} isOpen={openMenu === 'text'} onClick={() => toggleMenu('text')}>
            <DropdownSectionTitle title={t('studio.menu.sections.text')} />
            <DropdownItem icon={<Scaling size={14} />} label={t('studio.menu.textLength')} onClick={() => { transform.addTextLength(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<ArrowRightLeft size={14} />} label={t('studio.menu.reverseText')} onClick={() => { transform.reverseText(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Split size={14} />} label={t('studio.menu.splitColumn')} onClick={() => setActiveModal('split')} disabled={!activeCol} />
            <DropdownItem icon={<Combine size={14} />} label={t('studio.menu.mergeColumns')} onClick={() => setActiveModal('merge')} disabled={!activeCol} />
            <DropdownItem icon={<Replace size={14} />} label={t('studio.menu.replaceValue')} onClick={() => setActiveModal('replace')} disabled={!activeCol} />
            <DropdownItem icon={<Code size={14} />} label={t('studio.menu.extractRegexSubstr')} onClick={() => setActiveModal('regex')} disabled={!activeCol} />
            <DropdownSectionTitle title={t('studio.menu.sections.dates')} />
            <DropdownItem icon={<Calendar size={14} />} label={t('studio.menu.extractDatePart')} onClick={() => { transform.extractDatePart(activeCol, 'year'); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Calendar size={14} />} label={t('studio.menu.dayOfWeek')} onClick={() => { transform.getDayOfWeek(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Calendar size={14} />} label={t('studio.menu.quarter')} onClick={() => { transform.getQuarter(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<CalendarPlus size={14} />} label={t('studio.menu.addDaysMonths')} onClick={() => setActiveModal('dateOps')} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label={t('studio.top.calc')} icon={<Calculator size={16} />} isOpen={openMenu === 'tools'} onClick={() => toggleMenu('tools')}>
            <DropdownItem icon={<Calculator size={14} />} label={t('studio.menu.mathOps')} onClick={() => setActiveModal('math')} disabled={!activeCol} />
            <DropdownSectionTitle title={t('studio.menu.sections.advanced')} />
            <DropdownItem icon={<Calculator size={14} />} label={t('studio.menu.absRound')} onClick={() => setActiveModal('calcAdvanced')} disabled={!activeCol} />
            <DropdownItem icon={<Sigma size={14} />} label={t('studio.menu.groupPivot')} onClick={() => setActiveModal('group')} disabled={!activeCol} />
            <DropdownItem icon={<Info size={14} />} label={t('studio.menu.stats')} onClick={showColumnStats} disabled={!activeCol} />
          </DropdownMenu>

          <DropdownMenu label={t('studio.top.ds')} icon={<BrainCircuit size={16} />} isOpen={openMenu === 'ds'} onClick={() => toggleMenu('ds')}>
            <DropdownItem icon={<BarChart4 size={14} />} label={t('studio.menu.zscore')} onClick={() => { transform.applyZScore(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<Scaling size={14} />} label={t('studio.menu.normalize01')} onClick={() => { transform.applyMinMax(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
            <DropdownItem icon={<TrendingUp size={14} />} label={t('studio.menu.oneHot')} onClick={() => { transform.applyOneHotEncoding(activeCol); setOpenMenu(null); }} disabled={!activeCol} />
          </DropdownMenu>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-wolf/20 mx-1"></div>
          
          <button onClick={transform.smartClean} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-persian/10 text-persian hover:bg-persian hover:text-white transition-colors" title="Limpieza automática inteligente">
            <Sparkles size={16} /> <span className="hidden xl:inline">Smart Clean</span>
          </button>
          
          <button onClick={() => setCompactMode(!compactMode)} title={compactMode ? "Modo Cómodo" : "Modo Compacto"} className={`p-1.5 rounded-lg transition-colors ${compactMode ? 'text-persian bg-persian/10' : 'text-gray-400 hover:text-gray-600 dark:text-wolf dark:hover:text-zinc'}`}>
            {compactMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          <div className="flex-1"></div>
          
          <button onClick={undoLastAction} disabled={actions.length === 0} title="Deshacer última acción" className="p-1.5 text-gray-500 hover:text-persian disabled:opacity-30 transition-colors">
            <Undo2 size={18} />
          </button>
          
          {!historyOpen && (
             <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-gray-500 hover:text-persian bg-gray-100 dark:bg-wolf/10 transition-colors border border-transparent hover:border-persian/20">
               <History size={14} /> {t('studio.historyTitle')}
             </button>
          )}
        </div>

        

        {/* --- MODALES Y MENÚ FLOTANTE --- */}
        
        {headerMenuOpen && (
            <div 
                className="floating-menu-container fixed z-[9999]"
                style={{ top: headerMenuPos.top, left: headerMenuPos.left }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()} 
            >
                <ColumnFilter 
                    data={data} 
                    column={headerMenuOpen} 
                    uniqueValues={uniqueValuesForFilter}
                    onClose={() => setHeaderMenuOpen(null)}
                    onApply={(selectedValues) => {
                        transform.applyFilter(headerMenuOpen, 'in', selectedValues);
                        setHeaderMenuOpen(null);
                    }}
                    onSortAsc={() => { transform.sortData(headerMenuOpen, 'asc'); setHeaderMenuOpen(null); }}
                    onSortDesc={() => { transform.sortData(headerMenuOpen, 'desc'); setHeaderMenuOpen(null); }}
                    onMoveLeft={() => { transform.moveColumn(headerMenuOpen, 'left'); setHeaderMenuOpen(null); }}
                    onMoveRight={() => { transform.moveColumn(headerMenuOpen, 'right'); setHeaderMenuOpen(null); }}
                    onRename={() => { setNewName(headerMenuOpen); setActiveModal('rename'); setHeaderMenuOpen(null); }}
                    onChangeType={() => { setActiveModal('type'); setHeaderMenuOpen(null); }}
                    onStats={showColumnStats}
                    onDuplicate={() => { transform.duplicateColumn(headerMenuOpen); setHeaderMenuOpen(null); }}
                    onDrop={() => { transform.dropColumn(headerMenuOpen); setHeaderMenuOpen(null); }}
                    onFillDown={() => { transform.fillDown(headerMenuOpen); setHeaderMenuOpen(null); }}
                    onTrim={() => { transform.trimText(headerMenuOpen); setHeaderMenuOpen(null); }}
                />
            </div>
        )}

        {/* --- MODALES --- */}
        {activeModal === 'examples_col' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] border border-gray-200 dark:border-wolf/20 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center gap-4">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Zap size={20} className="text-persian"/> Columna a partir de los ejemplos</h3>
                                <p className="text-xs text-gray-500">El sistema detectará el patrón automáticamente.</p>
                            </div>
                            <div className="flex items-center bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg p-1 ml-4">
                                <button onClick={() => handleScopeChange('all')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-2 ${scanScope === 'all' ? 'bg-persian text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}><ScanSearch size={14} /> Todas</button>
                                <button onClick={() => handleScopeChange('selection')} disabled={!activeCol} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-2 ${scanScope === 'selection' ? 'bg-persian text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50'}`}><MousePointerClick size={14} /> Solo {activeCol || 'sel'}</button>
                            </div>
                        </div>
                        <button onClick={closeModal}><X className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                        <table className="w-full text-left border-collapse border border-gray-200 dark:border-wolf/10">
                            <thead className="bg-gray-100 dark:bg-black/20 sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 text-xs font-bold border border-gray-200 dark:border-wolf/10 w-10 text-center">#</th>
                                    {columns.map(c => (<th key={c} className={`p-2 text-xs font-bold border border-gray-200 dark:border-wolf/10 text-gray-500 ${scanScope === 'selection' && activeCol === c ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' : ''} ${scanScope === 'selection' && activeCol !== c ? 'opacity-30' : ''}`}>{c}</th>))}
                                    <th className="p-2 text-xs font-bold border border-gray-200 dark:border-wolf/10 bg-persian/10 text-persian w-48 border-l-2 border-l-persian">{t('studio.menu.examplesColumn')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 20).map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="p-2 text-xs border border-gray-200 dark:border-wolf/10 text-center text-gray-400">{i+1}</td>
                                        {columns.map(c => (<td key={c} className={`p-2 text-xs border border-gray-200 dark:border-wolf/10 text-gray-600 dark:text-zinc ${scanScope === 'selection' && activeCol !== c ? 'opacity-30' : 'opacity-70'}`}>{String(row[c] || '')}</td>))}
                                        <td className="p-0 border border-gray-200 dark:border-wolf/10 border-l-2 border-l-persian relative"><input type="text" className="w-full h-full p-2 text-sm bg-transparent outline-none focus:bg-persian/5 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600" placeholder={previewExampleCol[i]} value={exampleMap[i] || ''} onChange={(e) => handleExampleChange(i, e.target.value)} />{!exampleMap[i] && previewExampleCol[i] && (<span className="absolute right-2 top-2 text-[10px] text-gray-300 italic pointer-events-none">auto</span>)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                        <div className="p-4 border-t border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5 rounded-b-xl">
                        <div className="text-xs">{inferredRule ? <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle2 size={14}/> {t('studio.patternLabel')}: {inferredRule.description || inferredRule.type}</span> : <span className="text-gray-400">{t('studio.examplesHint')}</span>}</div>
                        <div className="flex gap-2"><button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg">{t('common.cancel')}</button><button onClick={() => { transform.generateColumnFromExamples(customColName, exampleMap); closeModal(); }} disabled={!inferredRule} className="btn-primary-sm">{t('common.accept')}</button></div>
                        </div>
                </div>
            </div>
        )}

        {/* MODAL FILTRO AVANZADO (TIPO EXCEL) */}
        {activeModal === 'filter' && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={closeModal}
            >
                <ColumnFilter 
                    data={data} 
                    column={activeCol} 
                    uniqueValues={uniqueValuesForFilter}
                    onClose={closeModal}
                    onApply={(selectedValues) => {
                        transform.applyFilter(activeCol, 'in', selectedValues);
                        closeModal();
                    }}
                />
            </div>
        )}

        {/* OTROS MODALES */}
        {activeModal === 'rename' && <ModalBar title="Renombrar" onClose={closeModal}><input type="text" className="input-dark w-48" value={newName} onChange={e => setNewName(e.target.value)} autoFocus /><button onClick={() => { transform.renameColumn(activeCol, newName); closeModal(); }} className="btn-primary-sm">Guardar</button></ModalBar>}
        {activeModal === 'dropRows' && <ModalBar title="Borrar Sup." onClose={closeModal}><input type="number" min="1" className="input-dark w-20" value={rowsToRemove} onChange={e => setRowsToRemove(e.target.value)} /><button onClick={() => { transform.removeTopRows(rowsToRemove); closeModal(); }} className="btn-primary-sm bg-red-600">Borrar</button></ModalBar>}
        {activeModal === 'fillNulls' && <ModalBar title="Rellenar vacíos" onClose={closeModal}><input type="text" className="input-dark w-32" value={fillValue} onChange={e => setFillValue(e.target.value)} /><button onClick={() => { transform.fillNullsVar(activeCol, fillValue); closeModal(); }} className="btn-primary-sm">Rellenar</button></ModalBar>}
        {activeModal === 'impute' && <ModalBar title="Imputar (Num)" onClose={closeModal}><select className="input-dark w-32" value={imputeMethod} onChange={e => setImputeMethod(e.target.value)}><option value="mean">Media</option><option value="median">Mediana</option><option value="mode">Moda</option></select><button onClick={() => { transform.imputeNulls(activeCol, imputeMethod); closeModal(); }} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'type' && <ModalBar title="Cambiar Tipo" onClose={closeModal}><select className="input-dark w-32" value={targetType} onChange={e => setTargetType(e.target.value)}><option value="numeric">Número</option><option value="string">Texto</option><option value="date">Fecha (Y-M-D)</option></select><button onClick={() => { transform.changeType(activeCol, targetType); closeModal(); }} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'replace' && <ModalBar title="Reemplazar" onClose={closeModal}><input type="text" className="input-dark w-24" value={findText} onChange={e => setFindText(e.target.value)} placeholder="Buscar" /><span className="text-xs">por</span><input type="text" className="input-dark w-24" value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Nuevo" /><button onClick={() => { transform.replaceValues(activeCol, findText, replaceText); closeModal(); }} className="btn-primary-sm">Ok</button></ModalBar>}
        {activeModal === 'split' && <ModalBar title="Dividir" onClose={closeModal}><span className="text-xs">Delim:</span><input type="text" className="input-dark w-16 text-center" value={splitDelim} onChange={e => setSplitDelim(e.target.value)} /><button onClick={() => { transform.splitColumn(activeCol, splitDelim); closeModal(); }} className="btn-primary-sm">Dividir</button></ModalBar>}
        {activeModal === 'merge' && <ModalBar title="Unir" onClose={closeModal}><select className="input-dark w-24" value={mergeCol2} onChange={e=>setMergeCol2(e.target.value)}>{columns.filter(c=>c!==activeCol).map(c=><option key={c} value={c}>{c}</option>)}</select><span className="text-xs">Sep:</span><input type="text" className="input-dark w-10 text-center" value={mergeSep} onChange={e=>setMergeSep(e.target.value)} /><button onClick={() => { transform.mergeColumns(activeCol, mergeCol2, mergeSep); closeModal(); }} className="btn-primary-sm">Unir</button></ModalBar>}
        {activeModal === 'affix' && <ModalBar title="Prefijo/Sufijo" onClose={closeModal}><select className="input-dark w-20" value={affixType} onChange={e=>setAffixType(e.target.value)}><option value="prefix">Pre</option><option value="suffix">Suf</option></select><input type="text" className="input-dark w-24" value={affixText} onChange={e=>setAffixText(e.target.value)} /><button onClick={() => { transform.addAffix(activeCol, affixText, affixType); closeModal(); }} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'substring' && <ModalBar title="Subcadena" onClose={closeModal}><span className="text-xs">In:</span><input type="number" className="input-dark w-12" value={subStart} onChange={e=>setSubStart(e.target.value)} /><span className="text-xs">Len:</span><input type="number" className="input-dark w-12" value={subLen} onChange={e=>setSubLen(e.target.value)} /><button onClick={() => { transform.textSubstring(activeCol, subStart, subLen); closeModal(); }} className="btn-primary-sm">Cortar</button></ModalBar>}
        {activeModal === 'regex' && <ModalBar title="Regex Extract" onClose={closeModal}><input type="text" className="input-dark w-32 font-mono text-xs" value={regexPattern} onChange={e=>setRegexPattern(e.target.value)} /><button onClick={() => { transform.applyRegexExtract(activeCol, regexPattern); closeModal(); }} className="btn-primary-sm">Extraer</button></ModalBar>}
        {activeModal === 'mask' && <ModalBar title="Enmascarar" onClose={closeModal}><span className="text-xs">Visible:</span><input type="number" className="input-dark w-12" value={maskChars} onChange={e=>setMaskChars(e.target.value)} /><button onClick={() => { transform.maskData(activeCol, maskChars); closeModal(); }} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'pad' && <ModalBar title="Pad (Ceros)" onClose={closeModal}><span className="text-xs">Len:</span><input type="number" className="input-dark w-12" value={padLen} onChange={e=>setPadLen(e.target.value)} /><span className="text-xs">Char:</span><input type="text" className="input-dark w-8 text-center" value={padChar} onChange={e=>setPadChar(e.target.value)} /><button onClick={() => { transform.applyPadStart(activeCol, padLen, padChar); closeModal(); }} className="btn-primary-sm">Rellenar</button></ModalBar>}
        {activeModal === 'json' && <ModalBar title="JSON Extract" onClose={closeModal}><input type="text" className="input-dark w-32" value={jsonKey} onChange={e => setJsonKey(e.target.value)} placeholder="Key (ej: id)" /><button onClick={() => { transform.extractJson(activeCol, jsonKey); closeModal(); }} className="btn-primary-sm">Extraer</button></ModalBar>}
        {activeModal === 'addDays' && <ModalBar title="Sumar Días" onClose={closeModal}><input type="number" className="input-dark w-20" value={addDaysVal} onChange={e=>setAddDaysVal(e.target.value)} /><button onClick={() => { transform.addDaysToDate(activeCol, addDaysVal); closeModal(); }} className="btn-primary-sm">Sumar</button></ModalBar>}
        {activeModal === 'dateOps' && <ModalBar title="Operar Fechas" onClose={closeModal}><span className="text-xs">Sumar:</span><input type="number" className="input-dark w-16" value={addDaysVal} onChange={e=>setAddDaysVal(e.target.value)} placeholder="Días" /><button onClick={() => { transform.addDaysToDate(activeCol, addDaysVal); closeModal(); }} className="btn-primary-sm px-2">D</button><input type="number" className="input-dark w-16 ml-2" value={addMonthsVal} onChange={e=>setAddMonthsVal(e.target.value)} placeholder="Meses" /><button onClick={() => { transform.addMonthsToDate(activeCol, addMonthsVal); closeModal(); }} className="btn-primary-sm px-2">M</button></ModalBar>}
        {activeModal === 'math' && <ModalBar title="Cálculo" onClose={closeModal}><input type="text" placeholder="Nom. Columna" className="input-dark w-24" value={mathTarget} onChange={e => setMathTarget(e.target.value)} /><span className="text-xs">= {activeCol}</span><select className="input-dark w-10 text-center font-bold" value={mathOp} onChange={e => setMathOp(e.target.value)}><option value="+">+</option><option value="-">-</option><option value="*">*</option><option value="/">/</option></select><select className="input-dark w-24" value={mathCol2} onChange={e => setMathCol2(e.target.value)}>{columns.map(c=><option key={c} value={c}>{c}</option>)}</select><button onClick={() => { transform.applyMath(activeCol, mathCol2, mathOp, mathTarget); closeModal(); }} className="btn-primary-sm">Calc</button></ModalBar>}
        {activeModal === 'calcAdvanced' && <ModalBar title="Calc. Avanzado" onClose={closeModal}><select className="input-dark w-32" onChange={(e) => { const f = e.target.value; if(['ABS','FLOOR','CEIL','SQRT','LOG'].includes(f)) { transform.calcAdvanced(activeCol, f); closeModal(); } else { setTargetType(f); } }}><option value="">Seleccionar...</option><option value="ABS">Valor Absoluto</option><option value="FLOOR">Piso (Floor)</option><option value="CEIL">Techo (Ceil)</option><option value="SQRT">Raíz Cuadrada</option><option value="LOG">Logaritmo (Ln)</option><option value="POWER">Potencia (^)</option><option value="MOD">Módulo (%)</option></select>{['POWER','MOD'].includes(targetType) && <><input type="number" className="input-dark w-16" value={calcVal} onChange={e=>setCalcVal(e.target.value)} /><button onClick={() => { transform.calcAdvanced(activeCol, targetType, calcVal); closeModal(); }} className="btn-primary-sm">Aplicar</button></>}</ModalBar>}
        {activeModal === 'clip' && <ModalBar title="Limitar (Clip)" onClose={closeModal}><span className="text-xs">Min:</span><input type="number" className="input-dark w-14" value={clipMin} onChange={e=>setClipMin(e.target.value)} /><span className="text-xs">Max:</span><input type="number" className="input-dark w-14" value={clipMax} onChange={e=>setClipMax(e.target.value)} /><button onClick={() => { transform.clipValues(activeCol, clipMin, clipMax); closeModal(); }} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'round' && <ModalBar title="Redondear" onClose={closeModal}><span className="text-xs">Decimales:</span><input type="number" className="input-dark w-12" value={roundDecimals} onChange={e=>setRoundDecimals(e.target.value)} /><button onClick={() => { transform.applyRound(activeCol, roundDecimals); closeModal(); }} className="btn-primary-sm">Aplicar</button></ModalBar>}
        {activeModal === 'group' && <ModalBar title="Agrupar" onClose={closeModal}><select className="input-dark w-20" value={groupOp} onChange={e => setGroupOp(e.target.value)}><option value="SUM">Sumar</option><option value="AVG">Prom</option><option value="COUNT">Contar</option><option value="MAX">Max</option><option value="MIN">Min</option></select><select className="input-dark w-24" value={groupAggCol} onChange={e => setGroupAggCol(e.target.value)}>{columns.map(c=><option key={c} value={c}>{c}</option>)}</select><button onClick={() => { transform.applyGroup(activeCol, groupAggCol, groupOp); closeModal(); }} className="btn-primary-sm">Agrupar</button></ModalBar>}

        {activeModal === 'conditional_col' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-wolf/20 flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center">
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><GitFork size={20} className="text-persian"/> Agregar Columna Condicional</h3>
                        <button onClick={closeModal}><X className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre de la nueva columna</label>
                            <input type="text" className="input-dark w-64" value={customColName} onChange={e => setCustomColName(e.target.value)} />
                        </div>
                        <div className="space-y-3">
                            {condRules.map((rule, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-wolf/10">
                                    <span className="text-xs font-bold w-8 text-right">{idx === 0 ? 'Si' : 'O si'}</span>
                                    <select className="input-dark !w-32" value={rule.col} onChange={e => updateCondRule(idx, 'col', e.target.value)}>{columns.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                    <select className="input-dark !w-32" value={rule.op} onChange={e => updateCondRule(idx, 'op', e.target.value)}><option value="equals">es igual a</option><option value="not_equals">no es igual a</option><option value="contains">contiene</option><option value="starts_with">empieza con</option><option value=">">es mayor que</option><option value="<">es menor que</option><option value="is_null">es nulo</option></select>
                                    {!['is_null', 'not_null'].includes(rule.op) && (<input type="text" className="input-dark !w-32" placeholder="Valor" value={rule.val} onChange={e => updateCondRule(idx, 'val', e.target.value)} />)}
                                    <span className="text-xs font-bold">entonces</span>
                                    <input type="text" className="input-dark !w-32" placeholder="Salida" value={rule.output} onChange={e => updateCondRule(idx, 'output', e.target.value)} />
                                    <button onClick={() => removeCondRule(idx)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                                </div>
                            ))}
                            <button onClick={addCondRule} className="text-xs font-bold text-persian hover:underline flex items-center gap-1">+ Agregar regla</button>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 p-3 rounded-lg">
                            <span className="text-xs font-bold text-gray-500">De lo contrario:</span>
                            <input type="text" className="input-dark w-48" placeholder="Valor por defecto" value={condElse} onChange={e => setCondElse(e.target.value)} />
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-wolf/10 flex justify-end gap-2 bg-gray-50 dark:bg-white/5 rounded-b-xl">
                        <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg">Cancelar</button>
                        <button onClick={() => { transform.addConditionalColumn(customColName, condRules, condElse); closeModal(); }} className="btn-primary-sm">Aceptar</button>
                    </div>
                </div>
            </div>
        )}

        {activeModal === 'custom_col' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-wolf/20 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><FunctionSquare size={20} className="text-persian"/> {t('studio.customColTitle')}</h3>
                <button onClick={closeModal}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('studio.customColNameLabel')}</label>
                    <input type="text" className="input-dark" value={customColName} onChange={e => setCustomColName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('studio.customColFormulaLabel')}</label>
                            <div className="flex gap-4 h-64">
                                <div className="w-1/3 border border-gray-200 dark:border-wolf/10 rounded-lg overflow-hidden flex flex-col">
                                    <div className="bg-gray-100 dark:bg-white/5 p-2 text-xs font-bold text-center border-b border-gray-200 dark:border-wolf/10">Columnas Disponibles</div>
                                    <div className="flex-1 overflow-y-auto p-1 bg-white dark:bg-black/20">
                                        {columns.map(c => (<button key={c} onClick={() => setCustomFormula(prev => prev + `row['${c}']`)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-persian/10 text-gray-700 dark:text-zinc rounded truncate" title="Clic para insertar">{c}</button>))}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <textarea className="flex-1 w-full bg-[#1e1e1e] text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-persian focus:ring-1 focus:ring-persian resize-none leading-relaxed" value={customFormula} onChange={e => setCustomFormula(e.target.value)} placeholder="// Escribe tu fórmula JS aquí...&#10;return row['Precio'] * 1.16;"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-wolf/10 flex justify-end gap-2 bg-gray-50 dark:bg-white/5 rounded-b-xl">
                        <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg">Cancelar</button>
                        <button onClick={() => { transform.addCustomColumn(customColName, customFormula); closeModal(); }} className="btn-primary-sm">Aceptar</button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal Estadísticas */}
        {activeModal === 'stats' && colStats && (
          <div className="absolute top-16 right-4 z-50 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 p-4 rounded-xl shadow-2xl w-64 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-wolf/20 pb-2">
              <h3 className="font-bold text-gray-800 dark:text-zinc flex items-center gap-2"><Info size={16} className="text-persian"/> Estadísticas</h3>
              <button onClick={() => setActiveModal(null)}><XCircle size={16} className="text-gray-400 dark:text-wolf hover:text-red-400"/></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-wolf">Columna:</span> <span className="font-bold text-persian truncate max-w-[120px]">{colStats.colName}</span></div>
              <div className="border-t border-gray-200 dark:border-wolf/10 my-2"></div>
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

        {/* --- DATAGRID (TABLA PRINCIPAL) --- */}
        <div 
            className="flex-1 overflow-auto relative custom-scrollbar bg-white dark:bg-carbon-light z-0 rounded-b-xl"
            onScroll={handleScroll}
            ref={scrollContainerRef}
        >
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-carbon sticky top-0 z-10 shadow-sm">
              <tr>
                <th className={`w-12 text-center text-[10px] md:text-xs font-medium text-gray-500 border-b border-gray-200 dark:border-wolf/20 ${compactMode ? 'p-1' : 'p-2 md:p-3'}`}>#</th>
                {columns.map((col, idx) => {
                  return (
                    <th 
                      key={idx} 
                      onClick={() => setActiveCol(col)} 
                      onDoubleClick={() => { setNewName(col); setActiveModal('rename'); }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`relative group cursor-pointer transition-colors border-b border-gray-200 dark:border-wolf/20 ${compactMode ? 'p-1 md:p-2' : 'p-2 md:p-3'} ${activeCol === col ? 'bg-persian/10 text-persian border-b-2 border-persian' : 'hover:bg-gray-200 dark:hover:bg-wolf/10 text-gray-500 dark:text-wolf'} ${dropTargetIdx === idx ? 'border-l-4 border-l-persian bg-persian/5' : ''}`}
                    >
                      <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider justify-between min-w-[100px] md:min-w-[150px]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <GripVertical size={12} className="text-gray-300 dark:text-wolf/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate max-w-[80px] md:max-w-[130px]" title="Doble clic para renombrar">{col}</span>
                          </div>
                          
                          {/* BOTÓN TRIGGER MENU */}
                          <button 
                            onClick={(e) => toggleHeaderMenu(col, e)} 
                            className={`header-trigger p-1 rounded hover:bg-gray-300 dark:hover:bg-wolf/20 transition-colors opacity-50 group-hover:opacity-100 ${headerMenuOpen === col ? 'opacity-100 bg-gray-200 dark:bg-wolf/20 text-persian' : ''}`}
                            title="Opciones de columna"
                          >
                             <MoreVertical size={14} />
                          </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-carbon-light divide-y divide-gray-100 dark:divide-wolf/5">
              {data.slice(0, visibleRows).map((row, i) => (
                <tr key={i} className="hover:bg-persian/5 group transition-colors">
                  <td className={`text-center text-[10px] md:text-xs text-gray-400 dark:text-wolf/50 font-mono border-r border-gray-100 dark:border-wolf/10 group-hover:text-gray-600 dark:group-hover:text-wolf ${compactMode ? 'py-1' : 'py-2 md:py-3'}`}>{i + 1}</td>
                  {columns.map((col, j) => (
                    <td key={j} className={`text-[10px] md:text-sm whitespace-nowrap max-w-[100px] md:max-w-[150px] lg:max-w-[200px] overflow-hidden text-ellipsis text-gray-700 dark:text-zinc/80 ${compactMode ? 'p-1 md:p-1.5' : 'p-1.5 md:p-3'} ${activeCol === col ? 'bg-persian/5 font-medium' : ''}`}>
                      {row[col] === null ? <span className="text-gray-300 italic text-[9px] md:text-xs">null</span> : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-1 text-center text-[10px] text-gray-400 dark:text-wolf bg-gray-50 dark:bg-carbon border-t border-gray-200 dark:border-wolf/20 sticky bottom-0">
             {t('studio.showingRows')} {Math.min(visibleRows, data.length).toLocaleString()} / {data.length.toLocaleString()} {t('projects.rowsLabel')}
          </div>
        </div>
      </div>

      {/* --- HISTORIAL --- */}
      {/* Mobile Backdrop for History */}
       {historyOpen && (
         <div 
             className="md:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
             onClick={() => setHistoryOpen(false)}
         ></div>
       )}
 
       <div className={`
         transition-all duration-300 ease-in-out bg-white dark:bg-carbon-light flex flex-col shadow-2xl z-[80] h-full rounded-xl border border-gray-200 dark:border-wolf/10 overflow-hidden 
         fixed top-0 right-0 bottom-0 md:static md:h-full
         ${historyOpen ? 'w-[85vw] md:w-80 translate-x-0 opacity-100' : 'w-0 translate-x-full md:translate-x-0 opacity-0 md:w-0 border-0 md:ml-0'}
         md:ml-3
       `}>
        <div className="p-4 border-b border-gray-200 dark:border-wolf/20 bg-gray-50 dark:bg-[#1a1a1a] flex justify-between items-center h-[53px]">
          <h3 className="font-bold text-gray-800 dark:text-zinc flex items-center gap-2 text-sm"><History size={16} className="text-persian" /> {t('studio.historyTitle')}</h3>
          <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-carbon-light">
          {actions.length === 0 ? (
            <div className="text-center mt-10 opacity-50"><History size={40} className="mx-auto mb-2 text-gray-300 dark:text-wolf"/><p className="text-xs text-gray-400">{t('studio.historyEmpty')}</p></div>
          ) : (
            actions.map((action, idx) => (
              <div key={idx} className="group relative pl-4 pb-4 border-l-2 border-gray-200 dark:border-wolf/10 last:border-0 last:pb-0">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-persian border-4 border-white dark:border-[#2d2d2d] shadow-sm"></div>
                 <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-wolf/10 hover:border-persian/30 transition-colors cursor-pointer group-hover:shadow-md relative pr-8">
                   <div className="flex justify-between items-start mb-1"><span className="text-xs font-bold text-gray-700 dark:text-zinc uppercase tracking-wide">{action.type}</span><span className="text-[10px] text-gray-400 font-mono">#{idx+1}</span></div>
                   <p className="text-xs text-gray-500 dark:text-wolf leading-relaxed">{action.description}</p>
                   
                   {/* BOTÓN DE ELIMINAR PASO CON LÓGICA REAL DE TRANSFORMACIÓN */}
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         transform.deleteActionFromHistory(idx);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title={t('studio.historyDeleteStep')}
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-wolf/20 bg-gray-50 dark:bg-[#1a1a1a]">
          <div className="rounded-xl border border-gray-200 dark:border-wolf/20 bg-white dark:bg-carbon-light p-2 shadow-sm">
            <div ref={adRefStudio} style={{ width: 320, height: 50 }} className="flex items-center justify-center" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const DropdownMenu = ({ label, icon, children, isOpen, onClick }) => {
  const [term, setTerm] = useState('');
  const inputRef = useRef(null);
  const { t } = useI18n();
  
  useEffect(() => { 
    if (isOpen) { 
      const timer = setTimeout(() => {
        setTerm('');
        if(inputRef.current) inputRef.current.focus();
      }, 50); 
      return () => clearTimeout(timer);
    } 
  }, [isOpen]);

  const items = React.Children.toArray(children).filter(child => {
    if (!child.props || (!child.props.label && !child.props.title)) return true;
    if (child.props.title) return true;
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
            <div className="relative"><Search size={12} className="absolute left-2.5 top-2.5 text-gray-400 dark:text-wolf/70" /><input ref={inputRef} type="text" placeholder={t('common.search')} className="w-full bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg pl-8 pr-2 py-1.5 text-xs text-gray-700 dark:text-zinc focus:outline-none focus:border-persian placeholder:text-gray-400 dark:placeholder:text-wolf/50" value={term} onChange={(e) => setTerm(e.target.value)} onClick={(e) => e.stopPropagation()} /></div>
          </div>
          <div className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar">{items.length > 0 ? items : <div className="p-4 text-center text-xs text-gray-400 dark:text-wolf opacity-70">{t('common.noResults')}</div>}</div>
        </div>
      )}
    </div>
  );
};

const DropdownSectionTitle = ({ title }) => (
  <div className="px-3 py-1.5 mt-1 text-[10px] uppercase text-gray-400 dark:text-wolf/60 font-bold tracking-wider select-none bg-gray-50/50 dark:bg-white/5 border-y border-gray-100 dark:border-white/5">
    {title}
  </div>
);

const DropdownItem = ({ icon, label, onClick, disabled, danger }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left rounded-lg transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : danger ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-700 dark:text-zinc hover:bg-gray-100 dark:hover:bg-persian/5 hover:text-persian'}`}>{icon} {label}</button>
);

const ModalBar = ({ title, children, onClose }) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-2 px-3 rounded-lg border border-persian/30 shadow-lg flex gap-2 items-center animate-in slide-in-from-top-2 flex-wrap relative pr-8 mx-1 z-20 ring-1 ring-black/5">
     <span className="text-xs font-bold text-persian whitespace-nowrap border-r border-gray-200 dark:border-wolf/20 pr-2 mr-1">{title}</span>{children}<button onClick={onClose} className="absolute right-2 top-2.5 text-gray-400 dark:text-wolf hover:text-red-400"><XCircle size={14}/></button>
  </div>
);
