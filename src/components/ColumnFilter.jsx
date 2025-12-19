import React, { useState, useMemo } from 'react';
import { Search, Check, ArrowDownAZ, ArrowUpAZ, MoreHorizontal, ChevronRight, ArrowLeft, ArrowRight, Copy, Edit3, ArrowRightLeft, Info, ArrowDownToLine, Scissors, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n/i18n.jsx';

const MenuItem = ({ icon, label, onClick, hasSubmenu, danger, onMouseEnter, onMouseLeave, children, isOpen }) => (
  <div 
    className="relative w-full"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <button 
        onClick={(e) => {
            if (hasSubmenu) {
                if (onClick) onClick(e);
            } else {
                onClick && onClick(e);
            }
        }} 
        className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-persian/5 dark:hover:bg-white/5 transition-colors group relative ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-700 dark:text-zinc'}`}
    >
        <span className={`${danger ? 'text-red-500' : 'text-gray-400 dark:text-zinc/50 group-hover:text-persian'}`}>{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        {hasSubmenu && <ChevronRight size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90 md:rotate-0' : ''}`}/>}
    </button>
    {children}
  </div>
);

export default function ColumnFilter({ 
    data, column, onApply, onClose, onSortAsc, onSortDesc, 
    onMoveLeft, onMoveRight, onRename, onChangeType, onStats, onDuplicate, onDrop,
    onFillDown, onTrim, uniqueValues: providedUniqueValues
}) {
  const { t } = useI18n();
  // 1. Extraer valores únicos de la columna (o usar los provistos si existen)
  const uniqueValues = useMemo(() => {
    if (providedUniqueValues) {
        const set = new Set(providedUniqueValues.map(v => (v === null || v === undefined) ? '(Vacío)' : String(v)));
        return Array.from(set).sort();
    }
    const values = data.map(row => row[column]);
    const set = new Set(values.map(v => (v === null || v === undefined) ? '(Vacío)' : String(v)));
    return Array.from(set).sort();
  }, [data, column, providedUniqueValues]);

  const [searchText, setSearchText] = useState('');
  
  // Inicializamos selected con lo que ACTUALMENTE es visible en 'data' (para reflejar el estado actual del filtro),
  // pero la lista 'uniqueValues' mostrará TODAS las opciones posibles.
  const [selected, setSelected] = useState(() => {
      // Si se proveyeron valores externos (contexto completo), usamos 'data' para saber qué está seleccionado actualmente.
      // Todo lo que está en 'data' está seleccionado. Lo que está en 'providedUniqueValues' pero NO en 'data' está deseleccionado.
      const currentVisible = new Set(data.map(r => (r[column] === null || r[column] === undefined) ? '(Vacío)' : String(r[column])));
      return currentVisible;
  });

  const [showSubmenu, setShowSubmenu] = useState(null); // 'move', 'transform'
  const [addSelectionToFilter, setAddSelectionToFilter] = useState(false); // Checkbox "Agregar la selección actual al filtro"

  // 2. Filtrar valores según búsqueda
  const filteredValues = useMemo(() => {
    if (!searchText) return uniqueValues;
    return uniqueValues.filter(v => 
      v.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [uniqueValues, searchText]);

  // Si se busca algo, la opción "Agregar selección actual" debe aparecer
  const showAddSelectionOption = searchText.length > 0;

  const toggleValue = (val) => {
    const newSelected = new Set(selected);
    if (newSelected.has(val)) {
      newSelected.delete(val);
    } else {
      newSelected.add(val);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    // Si estamos buscando, "Seleccionar todo" solo afecta a los resultados filtrados
    const newSelected = new Set(selected);
    
    // Verificamos si todos los filtrados están seleccionados
    const allFilteredAreSelected = filteredValues.every(v => selected.has(v));

    if (allFilteredAreSelected) {
        // Deseleccionar todos los visibles
        filteredValues.forEach(v => newSelected.delete(v));
    } else {
        // Seleccionar todos los visibles
        filteredValues.forEach(v => newSelected.add(v));
    }
    setSelected(newSelected);
  };
  
  // Función wrapper para onApply que maneja la lógica de "Agregar selección"
  const handleApply = () => {
      let finalSelection;
      // Lógica tipo Excel:
      // Si hay búsqueda activa Y NO está marcada la opción de "Agregar a filtro":
      // El usuario espera que el filtro resultante sea SOLO lo que ha seleccionado en la vista actual (resultados de búsqueda).
      // Por tanto, debemos excluir todo lo que está oculto (que por defecto sigue en 'selected').
      if (searchText.length > 0 && !addSelectionToFilter) {
          finalSelection = Array.from(selected).filter(v => filteredValues.includes(v));
      } else {
          // Si no hay búsqueda O si el usuario quiere "Agregar a filtro":
          // Mantenemos todo lo que está en 'selected' (que incluye lo oculto + lo visible seleccionado).
          finalSelection = Array.from(selected);
      }
      onApply(finalSelection);
  };

  const renderValueItem = (value, index) => {
    const isSelected = selected.has(value);
    return (
      <div 
        key={index}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors group" 
        onClick={(e) => {
            e.preventDefault(); 
            toggleValue(value);
        }}
      >
        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-persian border-persian' : 'border-gray-400 dark:border-zinc/50 bg-white dark:bg-black/20 group-hover:border-persian'}`}>
            {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-xs text-gray-700 dark:text-zinc select-none flex-1 truncate" title={value}>
            {value}
        </span>
      </div>
    );
  };
  
  // VIRTUALIZACIÓN SIMPLE SI HAY MUCHOS DATOS
  // Si hay más de 1000 elementos, mostramos advertencia o limitamos renderizado
  const MAX_VISIBLE_ITEMS = 100; // Renderizamos solo los primeros 100 para rendimiento en DOM si no usamos virtual list real
  const visibleItems = filteredValues.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = filteredValues.length - MAX_VISIBLE_ITEMS;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-wolf/20 rounded-lg shadow-xl w-72 flex flex-col max-h-[600px] animate-in fade-in zoom-in-95 duration-150 overflow-hidden ring-1 ring-black/5 text-sm font-sans" onMouseDown={e => e.stopPropagation()}>
      
      {/* 1. ORDENAMIENTO COMPACTO */}
      <div className="p-1.5 flex gap-1 border-b border-gray-100 dark:border-wolf/10 shrink-0">
         <button onClick={onSortAsc} className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-700 dark:text-zinc transition-colors" title={t('filter.sortAsc')}>
            <ArrowDownAZ size={16} className="text-gray-500"/> <span className="text-xs">{t('filter.sortAsc')}</span>
         </button>
         <div className="w-px bg-gray-200 dark:bg-wolf/20 my-1"></div>
         <button onClick={onSortDesc} className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-700 dark:text-zinc transition-colors" title={t('filter.sortDesc')}>
            <ArrowUpAZ size={16} className="text-gray-500"/> <span className="text-xs">{t('filter.sortDesc')}</span>
         </button>
      </div>

      {/* 2. OPERACIONES PRINCIPALES - SCROLLABLE SI ES NECESARIO */}
      <div className="max-h-40 overflow-y-auto custom-scrollbar shrink-0 border-b border-gray-100 dark:border-wolf/10">
          <MenuItem icon={<Copy size={14}/>} label={t('filter.duplicateColumn')} onClick={onDuplicate} />
          <MenuItem icon={<Edit3 size={14}/>} label={t('filter.rename')} onClick={onRename} />
          <MenuItem icon={<ArrowRightLeft size={14}/>} label={t('filter.changeType')} onClick={onChangeType} />
          
          {/* Submenú Mover */}
          <MenuItem 
            icon={<ArrowRight size={14}/>} 
            label={t('filter.moveColumn')} 
            hasSubmenu
            isOpen={showSubmenu === 'move'}
            onClick={() => setShowSubmenu(showSubmenu === 'move' ? null : 'move')}
            onMouseEnter={() => window.innerWidth >= 768 && setShowSubmenu('move')}
            onMouseLeave={() => window.innerWidth >= 768 && setShowSubmenu(null)}
          >
             {showSubmenu === 'move' && (
                 <div className="relative md:absolute md:left-full md:top-0 w-full md:w-40 bg-gray-50 md:bg-white dark:bg-black/20 md:dark:bg-[#1a1a1a] border-y md:border border-gray-200 dark:border-wolf/20 md:rounded-lg md:shadow-xl py-1 md:ml-1 z-50 pl-4 md:pl-0">
                     <MenuItem icon={<ArrowLeft size={14}/>} label={t('filter.left')} onClick={onMoveLeft} />
                     <MenuItem icon={<ArrowRight size={14}/>} label={t('filter.right')} onClick={onMoveRight} />
                 </div>
             )}
          </MenuItem>

          {/* Submenú Transformar */}
          <MenuItem 
            icon={<Scissors size={14}/>} 
            label={t('filter.transformText')} 
            hasSubmenu
            isOpen={showSubmenu === 'trans'}
            onClick={() => setShowSubmenu(showSubmenu === 'trans' ? null : 'trans')}
            onMouseEnter={() => window.innerWidth >= 768 && setShowSubmenu('trans')}
            onMouseLeave={() => window.innerWidth >= 768 && setShowSubmenu(null)}
          >
             {showSubmenu === 'trans' && (
                 <div className="relative md:absolute md:left-full md:top-0 w-full md:w-40 bg-gray-50 md:bg-white dark:bg-black/20 md:dark:bg-[#1a1a1a] border-y md:border border-gray-200 dark:border-wolf/20 md:rounded-lg md:shadow-xl py-1 md:ml-1 z-50 pl-4 md:pl-0">
                     <MenuItem icon={<ArrowDownToLine size={14}/>} label={t('filter.fillDown')} onClick={onFillDown} />
                     <MenuItem icon={<Scissors size={14}/>} label={t('filter.trimSpaces')} onClick={onTrim} />
                 </div>
             )}
          </MenuItem>

          <MenuItem icon={<Info size={14}/>} label={t('filter.stats')} onClick={onStats} />
          <div className="border-t border-gray-100 dark:border-wolf/10 mt-1 pt-1">
             <MenuItem icon={<Trash2 size={14}/>} label={t('filter.dropColumn')} onClick={onDrop} danger />
          </div>
      </div>

      {/* 3. FILTRO DE VALORES (ESTILO EXCEL CLÁSICO) */}
      <div className="flex-1 flex flex-col min-h-[250px] overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-wolf/10 shrink-0">
             <div className="relative">
                 <Search size={12} className="absolute left-2.5 top-2 text-gray-400"/>
                 <input 
                    type="text" 
                    placeholder={t('common.search')} 
                    className="w-full pl-8 pr-2 py-1 text-xs bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded focus:border-persian outline-none dark:text-zinc"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    autoFocus
                 />
             </div>
          </div>
          
          <div className="px-3 py-1.5 border-b border-gray-100 dark:border-wolf/10 flex flex-col gap-1 shrink-0 bg-white dark:bg-carbon z-10">
              <div className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer py-1" onClick={handleSelectAll}>
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${filteredValues.every(v => selected.has(v)) && filteredValues.length > 0 ? 'bg-persian border-persian' : 'border-gray-400 dark:border-zinc/50 bg-white dark:bg-black/20'}`}>
                      {filteredValues.every(v => selected.has(v)) && filteredValues.length > 0 && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-zinc">{t('common.selectAll')}</span>
              </div>
              
              {/* OPCIÓN: AGREGAR SELECCIÓN AL FILTRO (Solo aparece al buscar) */}
              {showAddSelectionOption && (
                  <div className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer py-1 ml-1" onClick={() => setAddSelectionToFilter(!addSelectionToFilter)}>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${addSelectionToFilter ? 'bg-yellow-500 border-yellow-500' : 'border-gray-400 dark:border-zinc/50 bg-white dark:bg-black/20'}`}>
                          {addSelectionToFilter && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-zinc/80 italic">{t('common.addSelectionToFilter')}</span>
                  </div>
              )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {filteredValues.length > 0 ? (
                <div className="py-1">
                    {visibleItems.map((value, index) => renderValueItem(value, index))}
                    {hiddenCount > 0 && (
                        <div className="px-3 py-2 text-xs text-gray-400 italic text-center border-t border-gray-100 dark:border-wolf/10">
                            ... {hiddenCount}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-wolf">
                    <span className="text-xs">{t('common.noResults')}</span>
                </div>
            )}
          </div>

          {/* FOOTER COMPACTO */}
          <div className="p-2 border-t border-gray-100 dark:border-wolf/10 flex justify-end gap-2 bg-gray-50 dark:bg-black/10 shrink-0">
            <button onClick={onClose} className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/10 rounded transition-colors">{t('common.cancel')}</button>
            <button 
              onClick={handleApply} 
              className="px-3 py-1 text-xs font-medium bg-persian text-white rounded hover:bg-persian-dark shadow-sm transition-colors"
            >
              {t('common.accept')}
            </button>
          </div>
      </div>
    </div>
  );
}
