import React, { useState } from 'react';
import { 
    Zap, Plus, Trash2, Play, Settings, Save, X, 
    FileText, Database, Code, CheckCircle2, AlertCircle, Clock,
    Layers, LayoutGrid
} from 'lucide-react';
import BatchProcessor from '../components/BatchProcessor';
import { useI18n } from '../i18n/i18n.jsx';

export default function AutomationHub() {
    const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'batch'
    const { t } = useI18n();
    
    // --- RULES LOGIC (Existing) ---
    const [rules, setRules] = useState(() => {
        const stored = localStorage.getItem('nocodepy_automation_rules');
        return stored ? JSON.parse(stored) : [];
    });
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [trigger, setTrigger] = useState('on_upload');
    const [conditionType, setConditionType] = useState('filename_contains');
    const [conditionValue, setConditionValue] = useState('');
    const [actionType, setActionType] = useState('auto_clean');
    const [actionConfig, setActionConfig] = useState('');

    const saveRules = (newRules) => {
        setRules(newRules);
        localStorage.setItem('nocodepy_automation_rules', JSON.stringify(newRules));
    };

    const handleSave = () => {
        const newRule = {
            id: editingRule ? editingRule.id : crypto.randomUUID(),
            name,
            trigger,
            condition: { type: conditionType, value: conditionValue },
            action: { type: actionType, config: actionConfig },
            active: true,
            lastRun: null,
            runCount: 0
        };

        if (editingRule) {
            saveRules(rules.map(r => r.id === editingRule.id ? newRule : r));
        } else {
            saveRules([...rules, newRule]);
        }
        closeModal();
    };

    const deleteRule = (id) => {
        if (window.confirm('¿Eliminar esta automatización?')) {
            saveRules(rules.filter(r => r.id !== id));
        }
    };

    const toggleRule = (id) => {
        saveRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const openModal = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setName(rule.name);
            setTrigger(rule.trigger);
            setConditionType(rule.condition.type);
            setConditionValue(rule.condition.value);
            setActionType(rule.action.type);
            setActionConfig(rule.action.config);
        } else {
            setEditingRule(null);
            setName('');
            setTrigger('on_upload');
            setConditionType('filename_contains');
            setConditionValue('');
            setActionType('auto_clean');
            setActionConfig('');
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    return (
        <div className="h-full flex flex-col p-6 bg-gray-50/50 dark:bg-black/20 overflow-hidden animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="text-persian" size={32} />
                        {t('automation.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-wolf mt-1">{t('automation.subtitle')}</p>
                </div>
                
                <div className="flex bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('rules')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'rules' ? 'bg-persian/10 text-persian shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <LayoutGrid size={16} /> {t('automation.tabs.rules')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('batch')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'batch' ? 'bg-persian/10 text-persian shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Layers size={16} /> {t('automation.tabs.batch')}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                {/* --- TAB: REGLAS --- */}
                {activeTab === 'rules' && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => openModal()}
                                className="bg-persian hover:bg-sea text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-persian/20 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Plus size={18} /> {t('automation.newRule')}
                            </button>
                        </div>

                        {rules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 dark:border-wolf/20 rounded-2xl bg-white/50 dark:bg-white/5">
                                <Zap size={48} className="text-gray-300 dark:text-wolf mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 dark:text-zinc">{t('automation.emptyTitle')}</h3>
                                <p className="text-gray-500 dark:text-wolf text-sm max-w-xs mx-auto mt-2">{t('automation.emptySubtitle')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rules.map(rule => (
                                    <div key={rule.id} className={`bg-white dark:bg-carbon border rounded-xl p-6 shadow-sm transition-all relative group ${rule.active ? 'border-persian/50 shadow-persian/5' : 'border-gray-200 dark:border-wolf/10 opacity-70'}`}>
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{rule.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock size={12} /> Ejecutado: {rule.runCount} veces
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg text-sm border border-gray-100 dark:border-wolf/10">
                                                <div className="font-bold text-gray-500 text-[10px] uppercase mb-1">{t('automation.rule.ifThis')}</div>
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <FileText size={14} className="text-persian" />
                                                    {rule.trigger === 'on_upload' ? t('automation.rule.onUpload') : rule.trigger}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 pl-6">
                                                    {t('automation.rule.condition')}: {rule.condition.type === 'filename_contains' ? t('automation.rule.filenameContains') : rule.condition.type} "{rule.condition.value}"
                                                </div>
                                            </div>

                                            <div className="flex justify-center text-gray-300"><ArrowDown /></div>

                                            <div className="bg-persian/5 dark:bg-persian/10 p-3 rounded-lg text-sm border border-persian/10">
                                                <div className="font-bold text-persian text-[10px] uppercase mb-1">{t('automation.rule.doThis')}</div>
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Settings size={14} className="text-persian" />
                                                    {rule.action.type === 'auto_clean' && t('automation.rule.autoClean')}
                                                    {rule.action.type === 'convert_format' && `${t('automation.rule.convertTo')} ${rule.action.config}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-wolf/10">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={rule.active} onChange={() => toggleRule(rule.id)} />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-persian"></div>
                                            </label>
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(rule)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 transition-colors"><Settings size={18} /></button>
                                                <button onClick={() => deleteRule(rule.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- TAB: BATCH PROCESSING --- */}
                {activeTab === 'batch' && (
                    <div className="max-w-4xl mx-auto">
                        <BatchProcessor />
                        
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm flex items-center gap-2">
                                    <Layers size={16}/> {t('automation.batch.massiveTitle')}
                                </h3>
                                <p className="text-xs text-blue-600 dark:text-blue-200">
                                    {t('automation.batch.massiveDesc')}
                                </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/20">
                                <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2 text-sm flex items-center gap-2">
                                    <Zap size={16}/> {t('automation.localTransformTitle')}
                                </h3>
                                <p className="text-xs text-purple-600 dark:text-purple-200">
                                    {t('automation.localTransformDesc')}
                                </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20">
                                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 text-sm flex items-center gap-2">
                                    <CheckCircle2 size={16}/> {t('automation.unifiedDownloadTitle')}
                                </h3>
                                <p className="text-xs text-green-600 dark:text-green-200">
                                    {t('automation.unifiedDownloadDesc')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL EDITOR */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-carbon rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-wolf/20 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <h3 className="font-bold text-xl dark:text-white">{editingRule ? t('automation.modal.editTitle') : t('automation.modal.newTitle')}</h3>
                            <button onClick={closeModal}><X size={24} className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                            {/* Paso 1: Nombre */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('automation.modal.nameLabel')}</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('automation.modal.namePlaceholder')} 
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-lg px-4 py-3 outline-none focus:border-persian transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Paso 2: Disparador */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-persian font-bold uppercase text-xs tracking-wider"><Zap size={14}/> {t('automation.modal.triggerLabel')}</div>
                                    <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-wolf/10">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Evento</label>
                                        <select 
                                            value={trigger} 
                                            onChange={(e) => setTrigger(e.target.value)}
                                            className="w-full bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg px-3 py-2 outline-none text-sm"
                                        >
                                            <option value="on_upload">{t('automation.rule.onUploadOption')}</option>
                                        </select>

                                        <div className="mt-4">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Condición (Filtro)</label>
                                            <div className="flex gap-2">
                                                <select 
                                                    value={conditionType} 
                                                    onChange={(e) => setConditionType(e.target.value)}
                                                    className="w-1/2 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg px-3 py-2 outline-none text-sm"
                                                >
                                                    <option value="filename_contains">Nombre contiene</option>
                                                    <option value="always">Siempre</option>
                                                </select>
                                                {conditionType !== 'always' && (
                                                    <input 
                                                        type="text" 
                                                        value={conditionValue} 
                                                        onChange={(e) => setConditionValue(e.target.value)}
                                                        placeholder="texto..." 
                                                        className="w-1/2 bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg px-3 py-2 outline-none text-sm"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Paso 3: Acción */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-persian font-bold uppercase text-xs tracking-wider"><Play size={14}/> Acción</div>
                                    <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-wolf/10">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo de Acción</label>
                                        <select 
                                            value={actionType} 
                                            onChange={(e) => setActionType(e.target.value)}
                                            className="w-full bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg px-3 py-2 outline-none text-sm"
                                        >
                                            <option value="auto_clean">Limpieza Inteligente (Auto)</option>
                                            <option value="convert_format">Convertir Formato</option>
                                        </select>

                                        {actionType === 'convert_format' && (
                                            <div className="mt-4">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Formato Destino</label>
                                                <select 
                                                    value={actionConfig} 
                                                    onChange={(e) => setActionConfig(e.target.value)}
                                                    className="w-full bg-white dark:bg-carbon border border-gray-200 dark:border-wolf/20 rounded-lg px-3 py-2 outline-none text-sm"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="SQL">SQL (Insert)</option>
                                                    <option value="JSON">JSON</option>
                                                    <option value="XML">XML</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-wolf/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-6 py-2 rounded-lg text-gray-500 font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="bg-persian hover:bg-sea text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-persian/20 transition-all active:scale-95 flex items-center gap-2">
                                <Save size={18} /> Guardar Regla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ArrowDown() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
    )
}
