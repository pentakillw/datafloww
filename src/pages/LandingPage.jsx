import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useI18n } from '../i18n/i18n.jsx';
import { 
  Database, Sparkles, Zap, Wand2, LayoutDashboard, 
  ArrowRight, FileSpreadsheet, Code2, Download, 
  CheckCircle2, XCircle, Terminal, BrainCircuit,
  Bot, FileCode2, Layers, PlayCircle, MousePointerClick
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { userEmail } = useData();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 font-sans selection:bg-persian/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-persian p-1.5 rounded-lg text-white"><Terminal size={20} /></div>
            NoCode<span className="text-persian">PY</span>
          </div>
          <div className="flex gap-4 items-center">
            {userEmail ? (
                <>
                    <span className="hidden sm:block text-sm text-slate-500 font-medium">{t('landing.nav.hello')} {userEmail.split('@')[0]}</span>
                    <button onClick={() => navigate('/')} className="px-5 py-2 text-sm font-bold bg-persian hover:bg-persian-dark text-white rounded-lg shadow-lg shadow-persian/20 transition-all active:scale-95 flex items-center gap-2">
                        <LayoutDashboard size={16} /> {t('landing.nav.toDashboard')}
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-persian transition-colors">
                    {t('landing.nav.signIn')}
                    </button>
                    <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold bg-persian hover:bg-persian-dark text-white rounded-lg shadow-lg shadow-persian/20 transition-all active:scale-95">
                    {t('landing.nav.createAccount')}
                    </button>
                </>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-persian/10 text-persian dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 border border-persian/20">
          <Bot size={14} /> {t('landing.hero.badge')}
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-slate-900 dark:text-white">
          {t('landing.hero.title1')} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-persian to-cyan-500">{t('landing.hero.title2Highlight')}</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t('landing.hero.desc')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate(userEmail ? '/' : '/login')} className="px-8 py-4 text-lg font-bold bg-persian hover:bg-sea text-white rounded-xl shadow-xl shadow-persian/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
            <Sparkles size={20} /> {userEmail ? t('landing.hero.primaryButtonLoggedIn') : t('landing.hero.primaryButtonLoggedOut')}
          </button>
          <button className="px-8 py-4 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-persian hover:text-persian transition-all flex items-center justify-center gap-2">
            <FileCode2 size={20} /> {t('landing.hero.viewGeneratedCode')}
          </button>
        </div>
      </header>

      {/* --- HOW IT WORKS SECTION (NUEVA) --- */}
      <section className="py-20 bg-slate-50 dark:bg-[#161b22] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold dark:text-white mb-4">{t('landing.how.title')}</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">{t('landing.how.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-persian/20 to-transparent"></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white dark:bg-[#0f1115] border-4 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl relative group hover:border-persian/50 transition-colors">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-persian text-white rounded-full flex items-center justify-center font-bold shadow-lg">1</div>
                        <FileSpreadsheet size={40} className="text-slate-400 group-hover:text-persian transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">{t('landing.how.step1.title')}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{t('landing.how.step1.desc')}</p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white dark:bg-[#0f1115] border-4 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl relative group hover:border-persian/50 transition-colors">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-persian text-white rounded-full flex items-center justify-center font-bold shadow-lg">2</div>
                        <MousePointerClick size={40} className="text-slate-400 group-hover:text-persian transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">{t('landing.how.step2.title')}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{t('landing.how.step2.desc')}</p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white dark:bg-[#0f1115] border-4 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl relative group hover:border-persian/50 transition-colors">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-persian text-white rounded-full flex items-center justify-center font-bold shadow-lg">3</div>
                        <PlayCircle size={40} className="text-slate-400 group-hover:text-persian transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">{t('landing.how.step3.title')}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{t('landing.how.step3.desc')}</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- VISUAL DEMO: THE CORE VALUE --- */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             
             {/* Left: The Visual Chaos */}
             <div className="space-y-6">
                <h2 className="text-3xl font-bold dark:text-white">{t('landing.core.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {t('landing.core.desc')}
                </p>
                
                <div className="space-y-4">
                  <FeatureCheck title={t('landing.core.features.smartClean.title')} desc={t('landing.core.features.smartClean.desc')} />
                  <FeatureCheck title={t('landing.core.features.colByExample.title')} desc={t('landing.core.features.colByExample.desc')} />
                  <FeatureCheck title={t('landing.core.features.nativeExport.title')} desc={t('landing.core.features.nativeExport.desc')} />
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
             <h2 className="text-3xl font-bold dark:text-white mb-4">{t('landing.cards.title')}</h2>
             <p className="text-slate-500 max-w-2xl mx-auto">{t('landing.cards.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card 
               icon={<BrainCircuit size={32}/>} 
               title={t('landing.cards.ai.title')}
               desc={t('landing.cards.ai.desc')}
             />
             <Card 
               icon={<Terminal size={32}/>} 
               title={t('landing.cards.code.title')}
               desc={t('landing.cards.code.desc')}
             />
             <Card 
               icon={<LayoutDashboard size={32}/>} 
               title={t('landing.cards.analysis.title')}
               desc={t('landing.cards.analysis.desc')}
             />
             <Card 
               icon={<Database size={32}/>} 
               title={t('landing.cards.massive.title')}
               desc={t('landing.cards.massive.desc')}
             />
             <Card 
               icon={<Wand2 size={32}/>} 
               title={t('landing.cards.transform.title')}
               desc={t('landing.cards.transform.desc')}
             />
             <Card 
               icon={<Download size={32}/>} 
               title={t('landing.cards.sql.title')}
               desc={t('landing.cards.sql.desc')}
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
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">{t('landing.cta.title')}</h2>
          <p className="text-slate-300 mb-8 text-lg relative z-10 max-w-2xl mx-auto">
            {t('landing.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-persian hover:bg-sea text-white font-bold rounded-xl transition-colors shadow-lg shadow-persian/30">
              {t('landing.cta.createAccount')}
            </button>
            <button onClick={() => navigate('/docs')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors backdrop-blur-sm">
              {t('landing.cta.readDocs')}
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
              {t('landing.footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('landing.footer.product')}</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/login" className="hover:text-persian">{t('landing.footer.items.transformer')}</Link></li>
              <li><Link to="/login" className="hover:text-persian">{t('landing.footer.items.smartClean')}</Link></li>
              <li><Link to="/login" className="hover:text-persian">{t('landing.footer.items.pythonExport')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('landing.footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/terms" className="hover:text-persian">{t('landing.footer.items.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-persian">{t('landing.footer.items.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 dark:border-white/5 text-center text-sm text-slate-400">
          {t('landing.footer.copyright')}
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
