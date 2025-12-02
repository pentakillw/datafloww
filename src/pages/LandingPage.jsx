import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Database, Sparkles, Zap, Wand2, LayoutDashboard, 
  ArrowRight, FileSpreadsheet, Code2, Download, 
  CheckCircle2, XCircle, Terminal, BrainCircuit,
  Bot, FileCode2, Layers
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-sans selection:bg-persian/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-persian p-1.5 rounded-lg text-white"><Terminal size={20} /></div>
            NoCode<span className="text-persian">PY</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-persian transition-colors">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold bg-persian hover:bg-persian-dark text-white rounded-lg shadow-lg shadow-persian/20 transition-all active:scale-95">
              Crear Cuenta
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-persian/10 text-persian dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 border border-persian/20">
          <Bot size={14} /> Tu programador Senior de Python virtual
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
          Automatiza Excel y Datos <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-persian to-cyan-500">sin escribir una línea de código.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Sube tus archivos, límpialos visualmente con herramientas inteligentes y exporta automáticamente una 
          <span className="font-mono text-persian bg-persian/10 px-2 mx-1 rounded text-base font-bold">App de Python (Tkinter)</span> 
          lista para usar. El poder de Pandas, la facilidad de un clic.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/login')} className="px-8 py-4 text-lg font-bold bg-persian hover:bg-sea text-white rounded-xl shadow-xl shadow-persian/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
            <Sparkles size={20} /> Empezar Gratis
          </button>
          <button className="px-8 py-4 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-persian hover:text-persian transition-all flex items-center justify-center gap-2">
            <FileCode2 size={20} /> Ver Código Generado
          </button>
        </div>
      </header>

      {/* --- VISUAL DEMO: THE CORE VALUE --- */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             
             {/* Left: The Visual Chaos */}
             <div className="space-y-6">
                <h2 className="text-3xl font-bold dark:text-white">De Caos a Código en segundos</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  NoCodePY entiende tus datos. Usa nuestro motor "Smart Clean" para detectar anomalías o enséñale al sistema con ejemplos y él deducirá la fórmula.
                </p>
                
                <div className="space-y-4">
                  <FeatureCheck title="Limpieza Inteligente" desc="Detecta nulos, espacios y formatos mixtos automáticamente." />
                  <FeatureCheck title="Columna por Ejemplos" desc="Tú escribes el resultado deseado, NoCodePY deduce la lógica (Regex/Split/Merge)." />
                  <FeatureCheck title="Exportación Nativa" desc="Te entregamos el script .py con interfaz gráfica incluida." />
                </div>
             </div>

             {/* Right: The Visual Representation */}
             <div className="relative group">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-persian to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
                  {/* Fake Browser Header */}
                  <div className="bg-slate-800 p-3 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="ml-4 bg-slate-900 px-3 py-1 rounded text-xs text-slate-400 font-mono flex-1 text-center">
                      app_generada.py
                    </div>
                  </div>
                  
                  {/* Code Block Preview */}
                  <div className="p-6 font-mono text-xs md:text-sm text-slate-300 overflow-hidden">
                    <div className="text-gray-500"># GENERATED BY NOCODEPY</div>
                    <div className="text-purple-400">import</div> <span className="text-white">pandas</span> <div className="text-purple-400">as</div> <span className="text-white">pd</span>
                    <div className="text-purple-400">import</div> <span className="text-white">tkinter</span> <div className="text-purple-400">as</div> <span className="text-white">tk</span>
                    <br/>
                    <span className="text-blue-400">def</span> <span className="text-yellow-300">process_data</span>(df):
                    <div className="pl-4 border-l border-slate-700 ml-1">
                      <span className="text-gray-500"># [PASO 1] Smart Clean</span>
                      <br/>
                      df = df.dropna()
                      <br/>
                      <span className="text-gray-500"># [PASO 2] Split Column 'Nombre'</span>
                      <br/>
                      df[[<span className="text-green-400">'Nombre'</span>, <span className="text-green-400">'Apellido'</span>]] = df[<span className="text-green-400">'Full'</span>].str.split(<span className="text-green-400">' '</span>, expand=<span className="text-blue-400">True</span>)
                      <br/>
                      <span className="text-gray-500"># [PASO 3] Z-Score Anomaly</span>
                      <br/>
                      df[<span className="text-green-400">'Score'</span>] = (df[<span className="text-green-400">'Venta'</span>] - df[<span className="text-green-400">'Venta'</span>].mean()) / df.std()
                    </div>
                    <div className="mt-2 text-persian blink">_</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- CARDS GRID --- */}
      <section className="py-24 bg-slate-50 dark:bg-[#161b22] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold dark:text-white mb-4">Todo lo que necesitas para dominar tus datos</h2>
             <p className="text-slate-500 max-w-2xl mx-auto">Ya seas analista de datos, contable o desarrollador buscando ahorrar tiempo, NoCodePY tiene las herramientas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card 
               icon={<BrainCircuit size={32}/>} 
               title="IA & Heurística" 
               desc="Motor 'Smart Clean' y 'Columna por Ejemplos'. No necesitas saber expresiones regulares, el sistema las deduce por ti."
             />
             <Card 
               icon={<Terminal size={32}/>} 
               title="Código Real" 
               desc="No te encerramos en nuestra plataforma. Exporta código Python limpio y documentado para usarlo donde quieras."
             />
             <Card 
               icon={<LayoutDashboard size={32}/>} 
               title="Análisis Visual" 
               desc="Dashboards automáticos que analizan la calidad de tus datos, detectan nulos y muestran distribuciones al instante."
             />
             <Card 
               icon={<Database size={32}/>} 
               title="Soporte Masivo" 
               desc="Maneja archivos CSV y Excel de gran tamaño sin bloquear tu navegador gracias a nuestra carga optimizada."
             />
             <Card 
               icon={<Wand2 size={32}/>} 
               title="Transformación Visual" 
               desc="Más de 50 operaciones disponibles: Filtros, Math, Fechas, JSON Extract, One-Hot Encoding y más."
             />
             <Card 
               icon={<Download size={32}/>} 
               title="SQL Generator" 
               desc="¿Necesitas subir los datos a una base de datos? Generamos los scripts 'CREATE TABLE' e 'INSERT' automáticamente."
             />
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-carbon to-black rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 p-12 opacity-10 text-persian">
            <Code2 size={250} />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Deja de sufrir con Excel y Macros</h2>
          <p className="text-slate-300 mb-8 text-lg relative z-10 max-w-2xl mx-auto">
            Únete a la evolución del ETL. Limpia datos visualmente y obtén la potencia de Python sin la curva de aprendizaje.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-persian hover:bg-sea text-white font-bold rounded-xl transition-colors shadow-lg shadow-persian/30">
              Crear Cuenta Gratis
            </button>
            <button onClick={() => navigate('/docs')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors backdrop-blur-sm">
              Leer Documentación
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white dark:bg-[#0f1115] border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-4 text-slate-900 dark:text-white">
               <div className="bg-persian p-1 rounded text-white"><Terminal size={16} /></div>
               NoCode<span className="text-persian">PY</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              La plataforma definitiva para transformar datos y generar automatizaciones en Python sin escribir código.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/login" className="hover:text-persian">Transformador</Link></li>
              <li><Link to="/login" className="hover:text-persian">Smart Clean</Link></li>
              <li><Link to="/login" className="hover:text-persian">Python Export</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/terms" className="hover:text-persian">Términos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-persian">Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 dark:border-white/5 text-center text-sm text-slate-400">
          © 2025 NoCodePY. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

// Sub-componentes visuales
function FeatureCheck({ title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="mt-1 text-persian bg-persian/10 p-1 rounded-full">
        <CheckCircle2 size={16} />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Card({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-persian/50 transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-persian/5 dark:bg-persian/20 text-persian rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}