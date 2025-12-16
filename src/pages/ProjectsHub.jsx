import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
    Folder, FolderPlus, Search, Calendar, FileText, 
    MoreVertical, Trash2, ArrowRight, Layers, Plus, X,
    LayoutGrid, List as ListIcon, Clock, RefreshCw
} from 'lucide-react';

export default function ProjectsHub() {
    const { projects, cloudFiles, createProject, deleteProject, assignFileToProject, refreshCloudFiles, showToast } = useData();
    const [viewMode, setViewMode] = useState('grid'); // grid | list
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // New Project Form
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        if (!newProjectName.trim()) return;
        createProject({ name: newProjectName, description: newProjectDesc });
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshCloudFiles();
        setTimeout(() => {
            setIsRefreshing(false);
            showToast('Archivos sincronizados correctamente', 'success');
        }, 800);
    };

    // Project Details View
    if (selectedProject) {
        const projectFiles = cloudFiles.filter(f => f.projectId === selectedProject.id);
        
        return (
            <div className="h-full flex flex-col p-6 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ArrowRight className="rotate-180 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Folder className="text-persian" fill="currentColor" fillOpacity={0.2} />
                                {selectedProject.name}
                            </h1>
                            <p className="text-gray-500 dark:text-wolf text-sm">{selectedProject.description || 'Sin descripción'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <button 
                            onClick={handleRefresh}
                            className={`p-2 text-gray-500 hover:text-persian hover:bg-persian/10 rounded-lg transition-all ${isRefreshing ? 'animate-spin text-persian' : ''}`}
                            title="Recargar archivos"
                        >
                            <RefreshCw size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 px-3 py-1 rounded-lg shadow-sm">
                            <Clock size={14} /> Created: {new Date(selectedProject.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* File List in Project */}
                <div className="flex-1 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-wolf/10 bg-gray-50 dark:bg-carbon-light flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 dark:text-zinc flex items-center gap-2">
                            <Layers size={18} className="text-persian"/> Archivos del Proyecto ({projectFiles.length})
                        </h3>
                        {/* Placeholder for Add File to Project button if we implement it here */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Arrastra archivos aquí o usa el Workspace</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {projectFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FolderPlus size={48} className="mb-4 opacity-50" />
                                <p>Este proyecto está vacío.</p>
                                <p className="text-xs">Asigna archivos desde el Workspace.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectFiles.map(file => (
                                    <div key={file.id} className="p-4 border border-gray-200 dark:border-wolf/10 rounded-xl bg-white dark:bg-carbon hover:border-persian/50 transition-all group relative">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                                <FileText size={20} />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('¿Quitar archivo del proyecto?')) assignFileToProject(file.id, null);
                                                }}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-gray-800 dark:text-zinc truncate" title={file.filename}>{file.filename}</h4>
                                        <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-wolf">
                                            <span>{file.row_count?.toLocaleString()} filas</span>
                                            <span>{(parseInt(file.file_size)/1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Projects Grid View
    return (
        <div className="h-full flex flex-col p-6 bg-gray-50/50 dark:bg-black/20 overflow-hidden animate-in fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Folder className="text-persian" size={32} />
                        Gestión de Proyectos
                    </h1>
                    <p className="text-gray-500 dark:text-wolf mt-1">Organiza tus archivos en espacios de trabajo dedicados.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-persian hover:bg-sea text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-persian/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nuevo Proyecto
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar proyectos..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-persian transition-all"
                    />
                </div>
                <div className="flex bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg p-1">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-white/10 text-persian' : 'text-gray-400'}`}><LayoutGrid size={18}/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 dark:bg-white/10 text-persian' : 'text-gray-400'}`}><ListIcon size={18}/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-wolf/10 rounded-2xl bg-white/50 dark:bg-white/5">
                        <FolderPlus size={48} className="mx-auto text-gray-300 dark:text-wolf mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No hay proyectos</h3>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">Crea tu primer proyecto para empezar a organizar.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                        {filteredProjects.map(project => {
                            const filesCount = cloudFiles.filter(f => f.projectId === project.id).length;
                            
                            return (
                                <div 
                                    key={project.id} 
                                    onClick={() => setSelectedProject(project)}
                                    className={`bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/10 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-persian/50 transition-all cursor-pointer group ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                                >
                                    <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${viewMode === 'list' ? 'mb-0' : ''} bg-persian/5 text-persian group-hover:scale-110 transition-transform`}>
                                            <Folder size={24} fill="currentColor" fillOpacity={0.3} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-persian transition-colors">{project.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-wolf line-clamp-2">{project.description || 'Sin descripción'}</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'mt-4 pt-4 border-t border-gray-100 dark:border-wolf/10 justify-between' : ''}`}>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-wolf">
                                            <Layers size={14} /> {filesCount} archivos
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(window.confirm('¿Eliminar proyecto? Se desvincularán los archivos.')) deleteProject(project.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-carbon rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-wolf/20 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <h3 className="font-bold text-lg dark:text-white">Nuevo Proyecto</h3>
                            <button onClick={() => setShowCreateModal(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newProjectName} 
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-lg px-4 py-2 outline-none focus:border-persian"
                                    placeholder="Ej: Análisis Q1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                                <textarea 
                                    value={newProjectDesc} 
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-lg px-4 py-2 outline-none focus:border-persian h-24 resize-none"
                                    placeholder="Opcional..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-wolf/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-lg">Cancelar</button>
                            <button onClick={handleCreate} className="bg-persian hover:bg-sea text-white px-6 py-2 rounded-lg font-bold shadow-lg">Crear Proyecto</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
