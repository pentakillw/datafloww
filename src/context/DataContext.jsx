/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// --- MOCK SUPABASE CLIENT (Para evitar errores de compilación en Demo) ---
// En producción, descomenta la siguiente línea y elimina el bloque 'const supabase = ...'
import { supabase } from '../lib/supabase';
// ------------------------------------------------------------------------

const DataContext = createContext();

export function DataProvider({ children }) {
  // --- ESTADOS DE DATOS ---
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  const [originalData, setOriginalData] = useState([]);
  const [originalColumns, setOriginalColumns] = useState([]);

  const [fileName, setFileName] = useState(null);
  const [currentFileId, setCurrentFileId] = useState(null);
  
  const [history, setHistory] = useState([]); 
  const [actions, setActions] = useState([]); 

  // --- SUSCRIPCIÓN & USUARIO ---
  const [userTier, setUserTier] = useState('free');
  const [userEmail, setUserEmail] = useState('');
  
  const [cloudFiles, setCloudFiles] = useState([]); 
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState(() => {
      const stored = localStorage.getItem('nocodepy_trash');
      return stored ? JSON.parse(stored) : [];
  }); // Papelera local
  
  // --- GESTIÓN DE PROYECTOS (LOCAL MOCK -> SUPABASE) ---
  const [projects, setProjects] = useState([]);

  // Cargar proyectos desde Supabase al inicio
  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && mounted) {
        const { data: userProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (userProjects) {
          setProjects(userProjects);
        }
      }
    };
    fetchProjects();
    return () => { mounted = false; };
  }, []);

  const createProject = async (projectData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newProject, error } = await supabase.from('projects').insert({
          user_id: user.id,
          name: projectData.name,
          description: projectData.description
      }).select().single();

      if (error) {
          showToast('Error al crear proyecto: ' + error.message, 'error');
          return;
      }

      setProjects(prev => [newProject, ...prev]);
      showToast('Proyecto creado exitosamente.', 'success');
      logSystemEvent('PROJECT_CREATE', { id: newProject.id, name: newProject.name });
  };

  const deleteProject = async (projectId) => {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      
      if (error) {
          showToast('Error al eliminar proyecto: ' + error.message, 'error');
          return;
      }

      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // En Supabase, si configuramos ON DELETE SET NULL, los archivos se desvinculan solos.
      // Pero actualizamos el estado local para reflejarlo inmediatamente
      setCloudFiles(prev => prev.map(f => 
          f.project_id === projectId ? { ...f, project_id: null, projectId: null } : f
      ));

      showToast('Proyecto eliminado.', 'info');
      logSystemEvent('PROJECT_DELETE', { id: projectId });
  };

  const assignFileToProject = async (fileId, projectId) => {
      const { error } = await supabase.from('user_files')
          .update({ project_id: projectId })
          .eq('id', fileId);

      if (error) {
          showToast('Error al mover archivo: ' + error.message, 'error');
          return;
      }

      // Actualizar estado local
      setCloudFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, project_id: projectId, projectId: projectId } : f
      ));
      
      showToast('Archivo movido al proyecto.', 'success');
  };

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
            setUserTier(profile.tier || 'free');
            // setUploadsUsed(profile.uploads_count || 0); // Deshabilitado para usar cloudFiles.length como límite activo
          }
        } catch (e) { console.error("Error perfil:", e); }

        await refreshCloudFiles(user.id);
      }
    };
    initSession();
    return () => { mounted = false; };
  }, []);



  // --- 1. INICIALIZACIÓN ---
  const refreshCloudFiles = async (userId) => {
    const uid = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    
    // Ahora obtenemos el campo project_id directamente de la base de datos
    const { data: files } = await supabase.from('user_files').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    
    if (files) {
      // Mapeamos para mantener compatibilidad con el frontend que usa 'projectId'
      const filesWithProjects = files.map(f => ({
          ...f,
          projectId: f.project_id // Asumimos que la columna en BD se llama project_id
      }));
      setCloudFiles(filesWithProjects);
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
      setOriginalData(newData); 
      setOriginalColumns(newCols);
      setFileName(fName);
      setHistory([]);
  };

  // --- 4. REGISTRO DE ARCHIVOS (PERSISTENCIA) ---
  const updateExistingFile = async (existingFileId, rows, size) => {
     // Actualizar metadatos del archivo existente sin consumir crédito nuevo
     const { data: updatedFile, error } = await supabase.from('user_files').update({
         row_count: rows,
         file_size: size
         // updated_at eliminado para evitar error de esquema si la columna no existe
     }).eq('id', existingFileId).select().single();

     if (error) {
         showToast('Error al actualizar archivo: ' + error.message, 'error');
         return { success: false };
     }

     setCurrentFileId(existingFileId);
     // Recuperar acciones guardadas
     const existingActions = updatedFile.actions || [];
     setActions(existingActions);
     setFileName(updatedFile.filename);

     logSystemEvent('FILE_UPDATE', { fileId: existingFileId, filename: updatedFile.filename });
     await refreshCloudFiles(); // Refrescar lista
     
     return { success: true, actions: existingActions, isUpdate: true };
  };

  const registerFile = async (filename, rows, size) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Verificación de existencia previa y Sistema de nombres únicos
    let finalName = filename;
    let counter = 1;
    
    // Aseguramos que la lista esté actualizada antes de verificar
    // (Nota: cloudFiles ya debería estar sincronizado, pero iteramos sobre él)
    while (cloudFiles.some(f => f.filename === finalName)) {
        const nameParts = filename.split('.');
        const ext = nameParts.length > 1 ? '.' + nameParts.pop() : '';
        const base = nameParts.join('.');
        finalName = `${base} (${counter})${ext}`;
        counter++;
    }

    if (finalName !== filename) {
        showToast(`Archivo renombrado a: ${finalName}`, 'info');
    }

    // Nuevo archivo: Costo de crédito
    const { data: newFile, error } = await supabase.from('user_files').insert({
      user_id: user.id,
      filename: finalName,
      row_count: rows,
      file_size: size,
      actions: [] 
    }).select().single();

    if (error) {
      showToast('Error al registrar: ' + (error.message || 'Error desconocido'), 'error');
      return { success: false, actions: [] };
    }

    setCurrentFileId(newFile?.id || 'temp-id'); 
    setActions([]); 
    setFileName(finalName); // Actualizamos el nombre en el contexto

    // Incrementar contador en BD (Solo informativo)
    const { data: currentProfile } = await supabase.from('profiles').select('uploads_count').eq('id', user.id).single();
    const newCount = (currentProfile?.uploads_count || 0) + 1;

    await supabase.from('profiles').update({ uploads_count: newCount }).eq('id', user.id);
    // setUploadsUsed(newCount); // Deshabilitado
    
    await refreshCloudFiles(user.id);
    logSystemEvent('FILE_CREATE', { fileId: newFile.id, filename: finalName });
    return { success: true, actions: [], isUpdate: false };
  };

  // --- 5. GESTIÓN DE ACCIONES ---
  const saveActionsToDB = async (newActions) => {
      if (!currentFileId) return;
      await supabase.from('user_files').update({ actions: newActions }).eq('id', currentFileId);
      
      setCloudFiles(prev => prev.map(f => 
        f.id === currentFileId ? { ...f, actions: newActions } : f
      ));
  };

  // Soft Delete (Papelera)
  const deleteFile = async (fileId) => {
      if (!deletedFileIds.includes(fileId)) {
          setDeletedFileIds(prev => [...prev, fileId]);
          showToast('Archivo movido a la papelera.', 'info');
          // Si el archivo eliminado es el actual, limpiar el workspace
          if (currentFileId === fileId) {
             resetWorkspace();
          }
      }
  };

  // Restaurar de Papelera
  const restoreFile = (fileId) => {
      setDeletedFileIds(prev => prev.filter(id => id !== fileId));
      showToast('Archivo restaurado.', 'success');
  };

  // Eliminación Permanente (Hard Delete)
  const permanentDeleteFile = async (fileId) => {
      const { error } = await supabase.from('user_files').delete().eq('id', fileId);
      if (error) {
          showToast('Error al eliminar: ' + error.message, 'error');
          logSystemEvent('DELETE_ERROR', { fileId, error: error.message });
          return;
      }
      setCloudFiles(prev => prev.filter(f => f.id !== fileId));
      setDeletedFileIds(prev => prev.filter(id => id !== fileId)); // Limpiar de papelera también
      
      logSystemEvent('PERMANENT_DELETE', { fileId, status: 'success' });
      showToast('Archivo eliminado permanentemente.', 'success');
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
    const newActions = actions.filter((_, i) => i !== index);
    
    setActions(newActions);
    saveActionsToDB(newActions); 

    setHistory(prev => prev.filter((_, i) => i !== index));
    showToast('Paso eliminado del historial.', 'info');
  };

  const resetWorkspace = () => {
    setData([]); setColumns([]); setFileName(null); setHistory([]); setActions([]); setCurrentFileId(null);
    setOriginalData([]); setOriginalColumns([]);
    showToast('Vista limpia.', 'warning');
  };

  // --- FUNCIÓN REDIRECCIÓN A PAGO REAL (STIPE CHECKOUT) ---
  const redirectToBilling = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showToast('Debes iniciar sesión para actualizar tu plan.', 'error');
        return;
    }
    
    // 1. Mostrar mensaje de carga
    showToast('Redirigiendo a la pasarela de pago...', 'info');

    // 2. Llama a tu función de Back-end (Edge Function)
    // ESTA URL DEBE SER EL ENDPOINT DE TU FUNCIÓN QUE CREA LA SESIÓN DE STRIPE CHECKOUT
    // const edgeFunctionUrl = `${window.location.origin}/api/create-stripe-session`; 
    
    // Simulación de respuesta de back-end:
    /*
    const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_xxx', returnUrl: `${window.location.origin}/dashboard` })
    });
    const session = await response.json();
    const stripeCheckoutUrl = session.url; 
    */

    // Como estamos en un entorno simulado:
    const stripeCheckoutUrl = `${window.location.origin}/billing`;
    
    // 3. Redirigir al usuario
    window.location.href = stripeCheckoutUrl;
  };

  const PLAN_LIMITS = {
    free: { maxRows: 1000, maxFiles: 3, exportCode: false },
    pro: { maxRows: 1000000, maxFiles: 50, exportCode: true } 
  };

  // Límite basado en archivos totales (Activos + Papelera)
  const activeFiles = cloudFiles.filter(f => !deletedFileIds.includes(f.id));
  const trashFiles = cloudFiles.filter(f => deletedFileIds.includes(f.id));
  
  // Requisito estricto: El límite cuenta TODOS los archivos, incluso los de la papelera
  const totalFilesUsage = cloudFiles.length; 
  const canUploadNew = totalFilesUsage < PLAN_LIMITS[userTier].maxFiles;

  // --- GESTIÓN DE PROYECTOS (LOCAL MOCK REMOVED) ---
  /*
  // Local functions removed to avoid conflict with Supabase implementation
  */

  // --- AUTOMATIZACIÓN ---
  const checkAutomationRules = (fileMeta) => {
      const storedRules = localStorage.getItem('nocodepy_automation_rules');
      if (!storedRules) return [];
      
      const rules = JSON.parse(storedRules);
      const activeRules = rules.filter(r => r.active && r.trigger === 'on_upload');
      
      const actionsToApply = [];
      const rulesExecuted = [];

      activeRules.forEach(rule => {
          let match = false;
          // 1. Evaluar Condición
          if (rule.condition.type === 'always') match = true;
          else if (rule.condition.type === 'filename_contains') {
              if (fileMeta.filename.toLowerCase().includes(rule.condition.value.toLowerCase())) match = true;
          }
          // Futuro: column_exists, etc.

          if (match) {
              // 2. Definir Acción
              if (rule.action.type === 'auto_clean') {
                  // Acciones predefinidas de limpieza
                  actionsToApply.push({ type: 'DELETE_EMPTY_ROWS', description: 'Auto-Clean: Eliminar filas vacías' });
                  actionsToApply.push({ type: 'TRIM_ALL', description: 'Auto-Clean: Recortar espacios' });
              } else if (rule.action.type === 'convert_format') {
                   // Añadimos una acción especial de sugerencia que no modifica datos pero queda en historial
                   actionsToApply.push({ type: 'SUGGEST_EXPORT', format: rule.action.config, description: `Automatización: Sugerencia Exportar a ${rule.action.config}` });
              }
              
              // Actualizar contadores de regla (localmente)
              rule.runCount = (rule.runCount || 0) + 1;
              rule.lastRun = new Date().toISOString();
              rulesExecuted.push(rule);
          }
      });

      // Guardar actualización de contadores
      if (rulesExecuted.length > 0) {
          const updatedRules = rules.map(r => {
              const executed = rulesExecuted.find(ex => ex.id === r.id);
              return executed || r;
          });
          localStorage.setItem('nocodepy_automation_rules', JSON.stringify(updatedRules));
          showToast(`⚡ ${rulesExecuted.length} regla(s) de automatización ejecutada(s).`, 'success');
      }

      return actionsToApply;
  };

  // --- LOGGING SYSTEM ---
  const logSystemEvent = (event, details) => {
     console.log(`[SYSTEM LOG] ${new Date().toISOString()} - ${event}:`, details);
     // Aquí se podría enviar a un endpoint de auditoría real
  };

  // Verificación periódica de integridad
  useEffect(() => {
      const interval = setInterval(() => {
          if (cloudFiles.length > 0) {
              logSystemEvent('INTEGRITY_CHECK', `Total Files: ${cloudFiles.length} (Active: ${activeFiles.length}, Trash: ${trashFiles.length})`);
          }
      }, 60000); // Cada minuto
      return () => clearInterval(interval);
  }, [cloudFiles, activeFiles.length, trashFiles.length]);

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
    filesUploadedCount: totalFilesUsage, // Ahora mostramos el uso TOTAL real
    cloudFiles: activeFiles, 
    trashFiles, 
    isLoadingFiles, refreshCloudFiles,
    registerFile, updateExistingFile, deleteFile, restoreFile, permanentDeleteFile, canUploadNew, redirectToBilling,
    checkAutomationRules, logSystemEvent,
    projects, createProject, deleteProject, assignFileToProject
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() { return useContext(DataContext); }