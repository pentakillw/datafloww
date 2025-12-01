/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState(null);
  
  // Historial: guarda snapshots de { data, columns }
  const [history, setHistory] = useState([]); 
  
  // Historial de ACCIONES (lista de instrucciones para logs)
  const [actions, setActions] = useState([]); 

  // --- SISTEMA DE NOTIFICACIONES (TOASTS) ---
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateData = (newData) => {
    // Guardamos estado anterior en historial antes de actualizar
    setHistory(prev => [...prev, { data, columns }]);
    setData(newData);
  };

  const logAction = (actionObj) => {
    // Añadimos timestamp si no viene
    const actionWithTime = { 
      ...actionObj, 
      timestamp: new Date().toLocaleTimeString() 
    };
    setActions(prev => [...prev, actionWithTime]); 
    showToast(`Acción aplicada: ${actionObj.description || actionObj.type}`, 'success');
  };

  const undoLastAction = () => {
    if (history.length === 0) return;

    // 1. Recuperar el último estado
    const lastState = history[history.length - 1];

    // 2. Restaurar
    if (lastState.data) setData(lastState.data);
    if (lastState.columns) setColumns(lastState.columns);

    // 3. Eliminar del historial de estados
    setHistory(prev => prev.slice(0, -1));

    // 4. Eliminar del log de acciones
    setActions(prev => prev.slice(0, -1));
    
    showToast('Acción deshecha correctamente', 'info');
  };

  const resetWorkspace = () => {
    setData([]);
    setColumns([]);
    setFileName(null);
    setHistory([]);
    setActions([]);
    showToast('Espacio de trabajo reiniciado', 'warning');
  };

  const value = {
    data,
    setData: updateData,
    columns,
    setColumns,
    fileName,
    setFileName,
    history,
    setHistory,
    actions,
    logAction,
    undoLastAction,
    resetWorkspace,
    toasts,
    showToast,
    removeToast
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}