import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Database, Wand2, BarChart3, 
  FileCode, Moon, Sun, LogOut, ChevronLeft, ChevronRight, ShieldCheck, Scale,
  BookOpen, MonitorPlay, Crown, User, Sparkles, Zap, FolderOpen, Settings, X, Save,
  Menu, Terminal, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';
import ToastContainer from './ToastContainer';
import { useI18n } from '../i18n/i18n.jsx';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu state
  const [showProfileModal, setShowProfileModal] = useState(false); // Modal de perfil
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtenemos datos del usuario y plan desde el contexto global
  const { userTier, userEmail, userProfile, updateProfile, simulateUpgrade, theme, toggleTheme } = useData();
  const darkMode = theme === 'dark';
  const { lang, setLang, t } = useI18n();

  // Estados locales para edición de perfil
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const openProfileModal = () => {
      setEditName(userProfile?.full_name || '');
      setEditAvatar(userProfile?.avatar_url || '');
      setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
      await updateProfile({ full_name: editName, avatar_url: editAvatar });
      setShowProfileModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: t('layout.menu.dashboard'), path: '/' },
    { icon: <FolderOpen size={20} />, label: t('layout.menu.projects'), path: '/projects' },
    { icon: <Database size={20} />, label: t('layout.menu.data'), path: '/data' },
    { icon: <Wand2 size={20} />, label: t('layout.menu.transform'), path: '/transform' },
    { icon: <BarChart3 size={20} />, label: t('layout.menu.analysis'), path: '/analysis' },
    { icon: <Zap size={20} />, label: t('layout.menu.automation'), path: '/automation' },
    { icon: <FileCode size={20} />, label: t('layout.menu.export'), path: '/export' },
    { icon: <MonitorPlay size={20} />, label: t('layout.menu.landing'), path: '/landing' },
    { icon: <Terminal size={20} />, label: t('layout.menu.guide'), path: '/guide' },
    { icon: <BookOpen size={20} />, label: t('layout.menu.docs'), path: '/docs' },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-zinc dark:bg-carbon overflow-hidden transition-colors duration-300">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-carbon border-b border-gray-200 dark:border-wolf/10 z-40 flex items-center px-4 justify-between">
           <div className="flex items-center gap-2 font-bold tracking-tight">
               <div className="min-w-[32px] h-8 bg-persian/10 text-persian rounded-lg flex items-center justify-center">
                 <Database size={18} />
               </div>
               <span className="text-xl text-carbon dark:text-zinc">
                 NoCode<span className="text-persian">PY</span>
               </span>
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500 dark:text-wolf hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
           <div className="md:hidden flex items-center gap-2">
             <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-xs bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-wolf/20 rounded px-2 py-1">
               <option value="es">ES</option>
               <option value="en">EN</option>
             </select>
           </div>
        </div>

        {/* MOBILE BACKDROP */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-[72px]'} 
          bg-white dark:bg-carbon-light border-r border-wolf/20 transition-all duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        `}>
          {/* Logo Area (Hidden on Mobile as we have header) */}
          <div className="hidden md:flex h-16 items-center justify-center border-b border-wolf/20 overflow-hidden relative shrink-0">
            <div className="flex items-center gap-2 font-bold tracking-tight whitespace-nowrap px-4 transition-all">
               <div className="min-w-[32px] h-8 bg-persian/10 text-persian rounded-lg flex items-center justify-center">
                 <Database size={18} />
               </div>
               <span className={`transition-opacity duration-200 text-xl text-carbon dark:text-zinc ${!sidebarOpen && 'opacity-0 w-0'}`}>
                 NoCode<span className="text-persian">PY</span>
               </span>
            </div>
          </div>

          {/* Menú Scrollable (Scrollbar oculto) */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide flex flex-col items-center mt-16 md:mt-0">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!sidebarOpen ? item.label : ''}
                className={`
                  w-full flex items-center justify-center p-3 rounded-lg transition-all group relative
                  ${location.pathname === item.path 
                    ? 'bg-persian/10 text-persian dark:bg-persian/20 shadow-sm border border-persian/10' 
                    : 'text-gray-500 dark:text-wolf hover:bg-gray-100 dark:hover:bg-white/5'}
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 w-full text-left">
                      {item.label}
                  </span>
                )}
                
                {!sidebarOpen && (
                  <div className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-carbon text-zinc text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* SECCIÓN DE PERFIL & PLAN (REDDISEÑADO) */}
          <div className="p-4 border-t border-wolf/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm shrink-0 flex flex-col gap-4">
             
             {/* Tarjeta de Plan PRO Promo (Solo si expandido y free) */}
             {sidebarOpen && userTier === 'free' && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-carbon to-black border border-wolf/10 text-center relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><Crown size={40} className="text-yellow-500 rotate-12"/></div>
                    <h4 className="text-white font-bold text-xs relative z-10 mb-2">Desbloquea PRO</h4>
                    <button 
                        onClick={simulateUpgrade}
                        className="w-full bg-persian hover:bg-sea text-white text-[10px] font-bold py-1.5 rounded-lg shadow-lg shadow-persian/20 transition-all active:scale-95 flex items-center justify-center gap-1 relative z-10"
                    >
                        <Sparkles size={10}/> Mejorar
                    </button>
                </div>
             )}

             {/* Perfil de Usuario */}
             <div 
                className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center flex-col gap-2'} transition-all`}
                onClick={openProfileModal}
             >
                {/* Avatar */}
                <div className="relative group cursor-pointer" title="Editar Perfil">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-persian to-purple-600 p-[2px] shadow-md transition-transform active:scale-95">
                        <div className="w-full h-full rounded-full bg-white dark:bg-carbon flex items-center justify-center overflow-hidden">
                             {userProfile?.avatar_url ? (
                                <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                                userTier === 'pro' ? <Crown size={16} className="text-yellow-500 fill-current"/> : <User size={18} className="text-gray-500 dark:text-wolf"/>
                             )}
                        </div>
                    </div>
                    {/* Status Dot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-carbon rounded-full"></div>
                </div>
                
                {/* Info (Solo Expandido) */}
                {sidebarOpen && (
                    <div className="flex-1 overflow-hidden animate-in fade-in duration-300 cursor-pointer hover:opacity-80">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                            {userProfile?.full_name || userEmail.split('@')[0]}
                        </h4>
                        <div className="flex items-center mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                userTier === 'pro' 
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 border-transparent'
                            }`}>
                                {userTier.toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}
             </div>

            {/* Action Toolbar */}
            <div className={`grid ${sidebarOpen ? 'grid-cols-4 gap-2' : 'grid-cols-1 gap-3'} transition-all`}>
                <button 
                   onClick={toggleTheme} 
                   className="h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-wolf transition-all group border border-transparent hover:border-wolf/10"
                   title={darkMode ? t('layout.tooltips.lightMode') : t('layout.tooltips.darkMode')}
                >
                   {darkMode ? <Sun size={18} className="group-hover:text-yellow-500 transition-colors"/> : <Moon size={18} className="group-hover:text-persian transition-colors"/>}
                </button>
                
                <button 
                   onClick={handleLogout} 
                   className="h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-wolf hover:text-red-500 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                   title={t('layout.tooltips.logout')}
                >
                   <LogOut size={18} />
                </button>

                <button 
                   onClick={() => setSidebarOpen(!sidebarOpen)}
                   className="hidden md:flex h-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-persian/10 text-gray-500 dark:text-wolf hover:text-persian transition-all border border-transparent hover:border-persian/20"
                   title={sidebarOpen ? t('layout.tooltips.collapse') : t('layout.tooltips.expand')}
                >
                 {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>

                {sidebarOpen && (
                  <button 
                    onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                    className="h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-persian/10 text-gray-700 dark:text-wolf hover:text-persian transition-all group border border-transparent hover:border-persian/20 font-bold text-xs"
                    title={lang === 'es' ? 'English' : 'Español'}
                  >
                    {lang === 'es' ? 'EN' : 'ES'}
                  </button>
                )}
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-auto relative bg-zinc dark:bg-carbon flex flex-col pt-16 md:pt-0">
          <div className="flex-1 w-full h-full relative">
             <Outlet />
          </div>
          <ToastContainer />
          
          {/* PROFILE MODAL */}
          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-carbon rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-wolf/20 overflow-hidden scale-100 transition-all">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-wolf/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-persian/10 rounded-lg text-persian"><Settings size={20} /></div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('layout.profile.editProfile')}</h3>
                        </div>
                        <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                    </div>
                    
                    {/* Body */}
                    <div className="p-6 space-y-5">
                        <div className="flex justify-center mb-6">
                             <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-persian to-purple-600 p-[3px] shadow-xl relative group">
                                <div className="w-full h-full rounded-full bg-white dark:bg-carbon flex items-center justify-center overflow-hidden">
                                     {editAvatar ? (
                                        <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                                     ) : (
                                        <User size={40} className="text-gray-300 dark:text-wolf" />
                                     )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-bold">{t('layout.profile.change')}</span>
                                </div>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('layout.profile.fullName')}</label>
                            <input 
                                type="text" 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-xl px-4 py-3 outline-none focus:border-persian focus:ring-2 focus:ring-persian/20 transition-all text-gray-900 dark:text-white"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('layout.profile.avatarUrl')}</label>
                            <input 
                                type="text" 
                                value={editAvatar} 
                                onChange={(e) => setEditAvatar(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-xl px-4 py-3 outline-none focus:border-persian focus:ring-2 focus:ring-persian/20 transition-all text-gray-900 dark:text-white text-sm font-mono"
                                placeholder="https://..."
                            />
                        </div>
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-xs text-blue-600 dark:text-blue-400">
                            <strong>{t('layout.profile.note')}</strong> {userEmail}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-wolf/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
                        <button onClick={() => setShowProfileModal(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors">{t('common.cancel')}</button>
                        <button onClick={handleSaveProfile} className="bg-persian hover:bg-sea text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-persian/20 flex items-center gap-2 transition-all active:scale-95">
                            <Save size={18} /> {t('layout.profile.saveChanges')}
                        </button>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
