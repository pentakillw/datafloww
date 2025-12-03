/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export function DataProvider({ children }) {
  // --- ESTADOS DE DATOS ---
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // Copia original para el motor de "Deshacer/Recalcular"
  const [originalData, setOriginalData] = useState([]);
  const [originalColumns, setOriginalColumns] = useState([]);

  const [fileName, setFileName] = useState(null);
  const [currentFileId, setCurrentFileId] = useState(null);
  
  const [history, setHistory] = useState([]); 
  const [actions, setActions] = useState([]); 

  // --- SUSCRIPCIÓN & USUARIO ---
  const [userTier, setUserTier] = useState('free');
  const [userEmail, setUserEmail] = useState('');
  const [uploadsUsed, setUploadsUsed] = useState(0);
  
  const [cloudFiles, setCloudFiles] = useState([]); 
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [toasts, setToasts] = useState([]);

  // --- 1. INICIALIZACIÓN ---
  useEffect(() => {
    let mounted = true;
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && mounted) {
        setUserEmail(user.email);
        try {
          // Obtener o Crear Perfil (Self-healing)
          let { data: profile } = await supabase
            .from('profiles')
            .select('tier, uploads_count')
            .eq('id', user.id)
            .maybeSingle(); 

          if (!profile) {
             const { data: newProfile } = await supabase
               .from('profiles')
               .insert({ id: user.id, email: user.email, tier: 'free', uploads_count: 0 })
               .select()
               .single();
             profile = newProfile;
          }
          
          if (profile) {
            setUserTier(profile.tier);
            setUploadsUsed(profile.uploads_count || 0);
          }
        } catch (e) { console.error("Error perfil:", e); }

        await refreshCloudFiles(user.id);
      }
    };
    initSession();
    return () => { mounted = false; };
  }, []);

  const refreshCloudFiles = async (userId) => {
    const uid = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    const { data: files } = await supabase.from('user_files').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (files) {
      setCloudFiles(files);
      setIsLoadingFiles(false);
    }
  };

  // --- 2. TOASTS (Con UUID) ---
  const showToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID(); 
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3000);
  }, []);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- 3. CARGA MAESTRA DE DATOS ---
  const loadNewData = (newData, newCols, fName) => {
      setData(newData);
      setColumns(newCols);
      // Guardar copia original para replay
      setOriginalData(newData); 
      setOriginalColumns(newCols);
      
      setFileName(fName);
      setHistory([]);
  };

  // --- 4. REGISTRO DE ARCHIVOS (PERSISTENCIA) ---
  const registerFile = async (filename, rows, size) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // A) RECUPERACIÓN (GRATIS)
    const existingFile = cloudFiles.find(f => f.filename === filename);
    if (existingFile) {
      showToast(`📂 Archivo recuperado (Sin costo).`, 'info');
      
      // FIX CRÍTICO: Obtener datos frescos de la BD en lugar de usar la memoria local (que puede ser antigua)
      const { data: freshFile } = await supabase
        .from('user_files')
        .select('*')
        .eq('id', existingFile.id)
        .single();

      // Usamos el archivo fresco si existe, si no el de memoria como fallback
      const fileToUse = freshFile || existingFile;
      
      setCurrentFileId(fileToUse.id); 
      
      let recoveredActions = [];
      if (fileToUse.actions && Array.isArray(fileToUse.actions) && fileToUse.actions.length > 0) {
          recoveredActions = fileToUse.actions;
          setActions(recoveredActions);
          showToast(`⚡ ${recoveredActions.length} pasos restaurados.`, 'success');
      } else {
          setActions([]);
      }
      return { success: true, actions: recoveredActions };
    }

    // B) NUEVO ARCHIVO (COSTO DE CRÉDITO)
    const { data: newFile, error } = await supabase.from('user_files').insert({
      user_id: user.id,
      filename: filename,
      row_count: rows,
      file_size: size,
      actions: [] 
    }).select().single();

    if (error) {
      showToast('Error al registrar: ' + error.message, 'error');
      return { success: false, actions: [] };
    }

    setCurrentFileId(newFile.id); 
    setActions([]); 

    // Incrementar contador en BD
    const { data: currentProfile } = await supabase.from('profiles').select('uploads_count').eq('id', user.id).single();
    const newCount = (currentProfile?.uploads_count || 0) + 1;

    await supabase.from('profiles').update({ uploads_count: newCount }).eq('id', user.id);
    setUploadsUsed(newCount);
    
    await refreshCloudFiles(user.id);
    return { success: true, actions: [] };
  };

  // --- 5. GESTIÓN DE ACCIONES ---
  const saveActionsToDB = async (newActions) => {
      if (!currentFileId) return;
      await supabase.from('user_files').update({ actions: newActions }).eq('id', currentFileId);
      
      // FIX: Actualizar también el estado local 'cloudFiles' para que la lista lateral se actualice al instante
      setCloudFiles(prev => prev.map(f => 
        f.id === currentFileId ? { ...f, actions: newActions } : f
      ));
  };

  // Setters expuestos para hooks
  const updateDataState = (d, c) => { setData(d); setColumns(c); };
  const updateActionsState = (newActions) => {
      setActions(newActions);
      saveActionsToDB(newActions);
  };

  const logAction = (actionObj) => {
    const actionWithTime = { ...actionObj, timestamp: new Date().toLocaleTimeString() };
    setActions(prev => {
        const updated = [...prev, actionWithTime];
        saveActionsToDB(updated);
        return updated;
    });
    showToast(`Acción: ${actionObj.description || actionObj.type}`, 'success');
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setData(lastState.data);
    setColumns(lastState.columns);
    setHistory(prev => prev.slice(0, -1));
    
    setActions(prev => {
        const updated = prev.slice(0, -1);
        saveActionsToDB(updated);
        return updated;
    });
    showToast('Deshecho', 'info');
  };

  // --- ELIMINAR ACCIÓN ESPECÍFICA ---
  const deleteAction = (index) => {
    if (index === actions.length - 1) {
        undoLastAction();
        return;
    }
    // Calcular nuevas acciones
    const newActions = actions.filter((_, i) => i !== index);
    
    // Actualizar estado y BD
    setActions(newActions);
    saveActionsToDB(newActions); // Esto guardará en BD y actualizará cloudFiles localmente

    setHistory(prev => prev.filter((_, i) => i !== index));
    showToast('Paso eliminado del historial.', 'info');
  };

  const resetWorkspace = () => {
    setData([]); setColumns([]); setFileName(null); setHistory([]); setActions([]); setCurrentFileId(null);
    setOriginalData([]); setOriginalColumns([]);
    showToast('Vista limpia.', 'warning');
  };

  const simulateUpgrade = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ tier: 'pro' }).eq('id', user.id);
    if (!error) {
      setUserTier('pro');
      showToast('¡Plan PRO activado permanentemente!', 'success');
    }
  };

  const PLAN_LIMITS = {
    free: { maxRows: 1000, maxFiles: 3, exportCode: false },
    pro: { maxRows: 1000000, maxFiles: 50, exportCode: true } 
  };

  const canUploadNew = uploadsUsed < PLAN_LIMITS[userTier].maxFiles;

  const value = {
    data, setData, 
    columns, setColumns,
    fileName, setFileName, 
    actions, history,
    originalData, originalColumns, 
    loadNewData, updateDataState, updateActionsState,
    logAction, undoLastAction, deleteAction, resetWorkspace, 
    toasts, showToast, removeToast,
    userTier, setUserTier, userEmail, planLimits: PLAN_LIMITS[userTier],
    filesUploadedCount: uploadsUsed, cloudFiles, isLoadingFiles,
    registerFile, canUploadNew, simulateUpgrade
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() { return useContext(DataContext); }