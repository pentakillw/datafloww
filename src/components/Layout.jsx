import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Database, Wand2, BarChart3, 
  FileCode, Moon, Sun, LogOut, ChevronLeft, ChevronRight, ShieldCheck, Scale,
  BookOpen, MonitorPlay, Crown, User, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(true); 
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtenemos datos del usuario y plan
  const { userTier, userEmail, simulateUpgrade } = useData();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Database size={20} />, label: 'Datos', path: '/data' },
    { icon: <Wand2 size={20} />, label: 'Transformar', path: '/transform' },
    { icon: <BarChart3 size={20} />, label: 'Análisis', path: '/analysis' },
    { icon: <FileCode size={20} />, label: 'Exportar', path: '/export' },
    { icon: <MonitorPlay size={20} />, label: 'Instalación', path: '/guide' },
    { icon: <BookOpen size={20} />, label: 'Documentación', path: '/docs' },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-zinc dark:bg-carbon overflow-hidden transition-colors duration-300">
        
        {/* SIDEBAR */}
        <aside className={`
          ${sidebarOpen ? 'w-64' : 'w-[72px]'} 
          bg-white dark:bg-carbon-light border-r border-wolf/20 transition-all duration-300 ease-in-out flex flex-col z-20 relative shadow-xl
        `}>
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center border-b border-wolf/20 overflow-hidden relative shrink-0">
            <div className="flex items-center gap-2 font-bold tracking-tight whitespace-nowrap px-4 transition-all">
               <div className="min-w-[32px] h-8 bg-persian/10 text-persian rounded-lg flex items-center justify-center">
                 <Database size={18} />
               </div>
               <span className={`transition-opacity duration-200 text-xl text-carbon dark:text-zinc ${!sidebarOpen && 'opacity-0 w-0'}`}>
                 NoCode<span className="text-persian">PY</span>
               </span>
            </div>
          </div>

          {/* Menú Scrollable */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!sidebarOpen ? item.label : ''}
                className={`
                  w-full flex items-center p-3 rounded-lg transition-all group relative
                  ${location.pathname === item.path 
                    ? 'bg-persian/10 text-persian dark:bg-persian/20 shadow-sm border border-persian/10' 
                    : 'text-gray-500 dark:text-wolf hover:bg-gray-100 dark:hover:bg-white/5'}
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {item.label}
                </span>
                
                {!sidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-carbon text-zinc text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* SECCIÓN DE PERFIL & PLAN (NUEVO) */}
          <div className="p-3 border-t border-wolf/20 bg-gray-50 dark:bg-black/20 shrink-0">
             
             {/* Tarjeta de Plan PRO Promo */}
             {sidebarOpen && userTier === 'free' && (
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-carbon to-black border border-wolf/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><Crown size={40} className="text-yellow-500 rotate-12"/></div>
                    <h4 className="text-white font-bold text-sm relative z-10">Pásate a PRO</h4>
                    <p className="text-wolf text-xs mt-1 mb-3 relative z-10">Desbloquea exportación Python y límites infinitos.</p>
                    <button 
                        onClick={simulateUpgrade}
                        className="w-full bg-persian hover:bg-sea text-white text-xs font-bold py-2 rounded-lg shadow-lg shadow-persian/20 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
                    >
                        <Sparkles size={12}/> Mejorar Plan
                    </button>
                </div>
             )}

             {/* Perfil Compacto */}
             <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-2' : 'justify-center'} py-2`}>
                <div className="w-8 h-8 rounded-full bg-persian/20 flex items-center justify-center text-persian shrink-0 border border-persian/30">
                    {userTier === 'pro' ? <Crown size={14} className="fill-current"/> : <User size={14}/>}
                </div>
                
                {sidebarOpen && (
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 dark:text-zinc truncate" title={userEmail}>
                            {userEmail.split('@')[0]}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${userTier === 'pro' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-gray-200 dark:bg-wolf/10 text-gray-500 border-transparent'}`}>
                                {userTier.toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}
             </div>

             {/* Controles Footer */}
             <div className="flex gap-1 mt-2">
                 <button onClick={toggleTheme} className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-white/5 text-gray-500 dark:text-wolf transition-colors" title="Tema">
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                 </button>
                 <button onClick={handleLogout} className="flex-1 flex items-center justify-center p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Salir">
                    <LogOut size={16} />
                 </button>
             </div>
             
             {/* Toggle Sidebar */}
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center p-1 mt-2 text-wolf hover:text-persian transition-colors"
             >
               {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
             </button>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-auto relative bg-zinc dark:bg-carbon flex flex-col">
          <div className="flex-1 w-full h-full relative">
             <Outlet />
          </div>
          <ToastContainer />
        </main>
      </div>
    </div>
  );
}