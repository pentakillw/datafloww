import React, { useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useI18n } from '../i18n/i18n.jsx';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Activity, Hash, FileBarChart, TrendingUp, Info, ShieldCheck, AlertTriangle, Layers, Type
} from 'lucide-react';

export default function AnalysisDashboard() {
  const { data, columns } = useData();
  const { t } = useI18n();
  const adRef = useRef(null);

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalCells = data.length * columns.length;
    let nullCount = 0;
    const typeCounts = { Texto: 0, Numérico: 0, Fecha: 0, Otro: 0 };

    // 1. Análisis de Columnas y Tipos
    const numericCols = [];
    const textCols = [];

    columns.forEach(col => {
      // Muestreo del primer valor no nulo para determinar tipo
      const sample = data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '')?.[col];
      
      if (!isNaN(parseFloat(sample)) && isFinite(sample)) {
        typeCounts.Numérico++;
        numericCols.push(col);
      } else if (!isNaN(Date.parse(sample)) && String(sample).length > 5 && (String(sample).includes('-') || String(sample).includes('/'))) {
        typeCounts.Fecha++;
        textCols.push(col); // Tratamos fechas como categorías para gráficas de barras por ahora
      } else {
        typeCounts.Texto++;
        textCols.push(col);
      }
    });

    // 2. Conteo de Nulos Global
    data.forEach(row => {
      columns.forEach(col => {
        if (row[col] === null || row[col] === '' || row[col] === undefined) nullCount++;
      });
    });

    const qualityScore = Math.max(0, 100 - Math.round((nullCount / totalCells) * 100));
    
    // 3. Preparar Datos para Gráficas
    
    // A) Distribución de Categorías (Top 10 del primer campo de texto)
    let barData = [];
    let categoryCol = textCols.length > 0 ? textCols[0] : columns[0];
    if (categoryCol) {
      const counts = {};
      data.forEach(row => { const val = row[categoryCol] || 'N/A'; counts[val] = (counts[val] || 0) + 1; });
      barData = Object.keys(counts)
        .map(key => ({ name: key, value: counts[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8
    }

    // B) Tendencia Numérica (Primer campo numérico)
    let areaData = [];
    let trendCol = numericCols.length > 0 ? numericCols[0] : null;
    if (trendCol) {
        areaData = data.slice(0, 50).map((row, i) => ({ 
            index: i + 1, 
            value: parseFloat(row[trendCol]) || 0 
        }));
    }

    // C) Tipos de Datos (Pie Chart)
    const pieData = Object.keys(typeCounts)
        .filter(k => typeCounts[k] > 0)
        .map(k => ({ name: k, value: typeCounts[k] }));

    return { 
        totalRows: data.length,
        totalCols: columns.length,
        qualityScore,
        nullCount,
        barData, 
        categoryCol, 
        areaData, 
        trendCol,
        pieData
    };
  }, [data, columns]);

  // Colores para gráficas
  const COLORS = ['#029CA3', '#07B5A7', '#A6E3E9', '#2F4858', '#FFBB28', '#FF8042'];

  // Inyección del banner (468x60) de forma segura dentro del contenedor
  useEffect(() => {
    const container = adRef.current;
    if (!container) return;
    container.innerHTML = '';
    const opt = document.createElement('script');
    opt.type = 'text/javascript';
    opt.text = `
      atOptions = {
        'key' : '47946a59b4ccee0990d1650b4f39fed5',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/47946a59b4ccee0990d1650b4f39fed5/invoke.js';
    script.async = true;
    container.appendChild(opt);
    container.appendChild(script);
    return () => { if (container) container.innerHTML = ''; };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-3 bg-gray-50/50 dark:bg-black/20">
        <div className="flex flex-col items-center text-gray-400 dark:text-wolf opacity-60">
           <FileBarChart size={64} className="mb-4" />
           <h2 className="text-xl font-bold">{t('analysis.noDataTitle')}</h2>
           <p className="text-sm">{t('analysis.noDataSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-start p-3 bg-gray-50/50 dark:bg-black/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-carbon relative z-10 rounded-xl border border-gray-200 dark:border-wolf/10 shadow-sm overflow-auto h-full p-6 md:p-8 custom-scrollbar">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc tracking-tight flex items-center gap-3">
               <Activity className="text-persian" size={32} /> {t('analysis.headerTitle')}
            </h2>
            <p className="text-gray-500 dark:text-wolf mt-1">{t('analysis.headerSubtitle')}</p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-wolf/10 w-full md:w-auto justify-center">
             <ShieldCheck size={18} className={stats.qualityScore > 80 ? "text-green-500" : stats.qualityScore > 50 ? "text-yellow-500" : "text-red-500"} />
             <span className="text-sm font-bold text-gray-700 dark:text-zinc">{t('analysis.qualityLabel')} <span className={stats.qualityScore > 80 ? "text-green-600" : "text-yellow-600"}>{stats.qualityScore}%</span></span>
          </div>
        </div>

        {/* Banner Publicitario (centrado, tamaño estándar 468x60) */}
        <div className="w-full flex justify-center mb-6">
          <div className="rounded-xl border border-gray-200 dark:border-wolf/10 bg-white dark:bg-carbon-light p-2 shadow-sm">
            <div ref={adRef} style={{ width: 468, height: 60 }} className="flex items-center justify-center" />
          </div>
        </div>

        {/* 1. KPIs Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title={t('analysis.kpis.totalRows')} 
            value={stats.totalRows.toLocaleString()} 
            icon={<Hash />} 
            color="text-blue-500" 
            bg="bg-blue-500/10" 
          />
          <KpiCard 
            title={t('analysis.kpis.totalCols')} 
            value={stats.totalCols} 
            icon={<Layers />} 
            color="text-purple-500" 
            bg="bg-purple-500/10" 
          />
          <KpiCard 
            title={t('analysis.kpis.emptyCells')} 
            value={stats.nullCount.toLocaleString()} 
            icon={<AlertTriangle />} 
            color={stats.nullCount > 0 ? "text-orange-500" : "text-green-500"} 
            bg={stats.nullCount > 0 ? "bg-orange-500/10" : "bg-green-500/10"}
            subtext={stats.nullCount > 0 ? t('analysis.kpis.needsCleaning') : t('analysis.kpis.datasetClean')}
          />
          <KpiCard 
            title={t('analysis.kpis.textFields')} 
            value={stats.pieData.find(d => d.name === 'Texto')?.value || 0} 
            icon={<Type />} 
            color="text-persian" 
            bg="bg-persian/10" 
          />
        </div>

        {/* 2. Gráficas Principales (Grid 2 columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Gráfica de Barras (Frecuencia) - Ocupa 2 espacios */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-carbon-light p-6 rounded-xl border border-gray-200 dark:border-wolf/20 shadow-sm flex flex-col h-[350px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-zinc flex items-center gap-2">
                        <FileBarChart size={18} className="text-persian"/> {t('analysis.charts.frequencyDistTitle')}
                    </h3>
                    <span className="text-xs bg-white dark:bg-black/20 px-3 py-1 rounded-full border border-gray-200 dark:border-wolf/10 text-gray-500 dark:text-wolf font-mono">
                        {t('analysis.charts.columnLabel')} {stats.categoryCol}
                    </span>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fill: '#888', fontSize: 11}} />
                            <Tooltip 
                                cursor={{fill: 'rgba(0,0,0,0.05)'}}
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {stats.barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfica de Pastel (Tipos de Datos) - Ocupa 1 espacio */}
            <div className="bg-gray-50 dark:bg-carbon-light p-6 rounded-xl border border-gray-200 dark:border-wolf/20 shadow-sm flex flex-col h-[350px]">
                <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-zinc flex items-center gap-2">
                    <Info size={18} className="text-blue-400"/> {t('analysis.charts.dataStructureTitle')}
                </h3>
                <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centro del Donut */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">{stats.totalCols}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t('analysis.charts.colsShort')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Gráfica de Área (Tendencia) - Ancho completo */}
        {stats.trendCol && (
            <div className="bg-gray-50 dark:bg-carbon-light p-6 rounded-xl border border-gray-200 dark:border-wolf/20 shadow-sm flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-zinc flex items-center gap-2">
                        <TrendingUp size={18} className="text-sea"/> {t('analysis.charts.numericTrendTitle')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-sea"></span>
                        <span className="text-xs text-gray-500 dark:text-wolf">{stats.trendCol}</span>
                    </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.areaData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#07B5A7" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#07B5A7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="index" hide />
                            <YAxis orientation="right" tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#07B5A7" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorVal)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

// Tarjeta KPI Mejorada
function KpiCard({ title, value, icon, color, bg, subtext }) {
  return (
    <div className="bg-gray-50 dark:bg-carbon-light p-5 rounded-xl border border-gray-200 dark:border-wolf/20 shadow-sm hover:shadow-md transition-all group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {subtext && <span className="text-[10px] bg-white dark:bg-white/5 px-2 py-1 rounded-full text-gray-400 border border-gray-100 dark:border-white/5">{subtext}</span>}
      </div>
      <div>
        <h3 className="text-3xl font-black text-gray-900 dark:text-zinc tracking-tight">{value}</h3>
        <p className="text-xs font-bold text-gray-500 dark:text-wolf uppercase tracking-wider mt-1">{title}</p>
      </div>
    </div>
  );
}
