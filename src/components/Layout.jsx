import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Database, Wand2, BarChart3, 
  FileCode, Moon, Sun, LogOut, ChevronLeft, ChevronRight, ShieldCheck, Scale,
  BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(true); 
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const navigate = useNavigate();
  const location = useLocation();

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
    { icon: <BookOpen size={20} />, label: 'Documentación', path: '/docs' },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-zinc dark:bg-carbon overflow-hidden transition-colors duration-300">
        
        {/* SIDEBAR COLAPSABLE */}
        <aside className={`
          ${sidebarOpen ? 'w-64' : 'w-[72px]'} 
          bg-white dark:bg-carbon-light border-r border-wolf/20 transition-all duration-300 ease-in-out flex flex-col z-20 relative shadow-xl
        `}>
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center border-b border-wolf/20 overflow-hidden relative">
            <div className="flex items-center gap-2 font-bold tracking-tight whitespace-nowrap px-4 transition-all">
               <div className="min-w-[32px] h-8 bg-persian/10 text-persian rounded-lg flex items-center justify-center">
                 <Database size={18} />
               </div>
               <span className={`transition-opacity duration-200 text-xl text-carbon dark:text-zinc ${!sidebarOpen && 'opacity-0 w-0'}`}>
                NoCode<span className="text-persian">PY</span>
                </span>
            </div>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
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
                
                {/* Tooltip flotante cuando está cerrado */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-carbon text-zinc text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-wolf/20 space-y-2 bg-gray-50 dark:bg-black/20">
             
             {/* Enlaces Legales Sutiles (Solo visibles si el sidebar está abierto) */}
             {sidebarOpen && (
               <div className="px-2 py-2 mb-2 space-y-1">
                 <Link to="/terms" target="_blank" className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-persian transition-colors">
                   <Scale size={10} /> Términos de Uso
                 </Link>
                 <Link to="/privacy" target="_blank" className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-persian transition-colors">
                   <ShieldCheck size={10} /> Privacidad
                 </Link>
               </div>
             )}

             <button onClick={toggleTheme} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-wolf/10 text-carbon dark:text-wolf transition-colors" title="Cambiar Tema">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                {sidebarOpen && <span className="ml-3 text-sm">Tema</span>}
             </button>
             <button onClick={handleLogout} className="w-full flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Salir">
                <LogOut size={20} />
                {sidebarOpen && <span className="ml-3 text-sm">Salir</span>}
             </button>
             
             {/* Toggle Button */}
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center p-1 mt-2 text-wolf hover:text-persian transition-colors"
             >
               {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
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