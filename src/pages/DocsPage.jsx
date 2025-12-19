import React, { useState, useMemo } from 'react';
import { 
  Search, TableProperties, Eraser, Type, Calendar, 
  GitFork, Calculator, Sparkles, ChevronRight, BookOpen 
} from 'lucide-react';
import { useI18n } from '../i18n/i18n.jsx';

// --- DICCIONARIO DE FUNCIONALIDADES ---
const STATIC_DOCS_IDS = ['smart', 'structure', 'cleaning', 'text', 'dates', 'logic', 'tools'];

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useI18n();

  const DOCS_DATA = useMemo(() => ([
    {
      id: 'smart',
      title: t('docsCatalog.smart.title'),
      icon: <Sparkles className="text-persian" />,
      description: t('docsCatalog.smart.desc'),
      features: [
        { name: t('docsCatalog.smart.features.autoClean.name'), desc: t('docsCatalog.smart.features.autoClean.desc') }
      ]
    },
    {
      id: 'structure',
      title: t('docsCatalog.structure.title'),
      icon: <TableProperties className="text-blue-500" />,
      description: t('docsCatalog.structure.desc'),
      features: [
        { name: t('docsCatalog.structure.features.promoteHeaders.name'), desc: t('docsCatalog.structure.features.promoteHeaders.desc') },
        { name: t('docsCatalog.structure.features.addIndex.name'), desc: t('docsCatalog.structure.features.addIndex.desc') },
        { name: t('docsCatalog.structure.features.duplicateColumn.name'), desc: t('docsCatalog.structure.features.duplicateColumn.desc') },
        { name: t('docsCatalog.structure.features.dropTopRows.name'), desc: t('docsCatalog.structure.features.dropTopRows.desc') },
        { name: t('docsCatalog.structure.features.dropColumn.name'), desc: t('docsCatalog.structure.features.dropColumn.desc') }
      ]
    },
    {
      id: 'cleaning',
      title: 'Limpieza',
      icon: <Eraser className="text-pink-500" />,
      description: 'Eliminación de datos sucios, nulos o incorrectos.',
      features: [
        { name: 'Eliminar Duplicados', desc: 'Busca filas idénticas y deja solo una ocurrencia.' },
        { name: 'Eliminar Filas Vacías', desc: 'Elimina las filas donde TODAS las celdas están vacías.' },
        { name: 'Limpiar Símbolos', desc: 'Elimina cualquier caracter que no sea letra o número (A-Z, 0-9). Ideal para limpiar IDs o códigos.' },
        { name: 'Rellenar Abajo (Fill Down)', desc: 'Si una celda está vacía, toma el valor de la celda de arriba. Común en reportes de Excel agrupados.' },
        { name: 'Rellenar Nulos (Valor)', desc: 'Reemplaza todas las celdas vacías de la columna por un valor fijo que tú escribas (ej: "0", "Sin Dato").' },
        { name: 'Imputar Nulos (Estadística)', desc: 'Rellena vacíos numéricos usando matemática: Promedio, Mediana o Moda de la columna.' },
        { name: 'Cambiar Tipo', desc: 'Fuerza el formato de la columna a Texto, Número o Fecha.' },
        { name: 'Renombrar', desc: 'Cambia el nombre del encabezado de la columna.' }
      ]
    },
    {
      id: 'text',
      title: 'Texto',
      icon: <Type className="text-purple-500" />,
      description: 'Manipulación avanzada de cadenas de texto.',
      features: [
        { name: 'Mayúsculas / Minúsculas', desc: 'Convierte todo el texto a UPPERCASE o lowercase.' },
        { name: 'Title Case', desc: 'Pone en mayúscula la primera letra de cada palabra (ej: "juan perez" -> "Juan Perez").' },
        { name: 'Extraer Iniciales', desc: 'Obtiene las primeras letras (ej: "Juan Perez" -> "JP").' },
        { name: 'Extraer Solo Números', desc: 'Elimina letras y deja solo dígitos (ej: "Tel: 55-123" -> "55123").' },
        { name: 'Slugify', desc: 'Convierte texto para URLs (ej: "Hola Mundo" -> "hola-mundo").' },
        { name: 'Eliminar Tildes', desc: 'Reemplaza vocales acentuadas por normales (á -> a).' },
        { name: 'Contar Palabras', desc: 'Cuenta cuántas palabras hay en la celda.' },
        { name: 'Extraer Dominio', desc: 'Si es un email, extrae lo que va después del @.' },
        { name: 'Trim Espacios', desc: 'Elimina espacios en blanco al inicio y al final del texto.' },
        { name: 'Concatenar / Unir', desc: 'Une el contenido de dos columnas con un separador.' },
        { name: 'Dividir Columna', desc: 'Separa una columna en dos usando un delimitador (coma, espacio, guion).' }
      ]
    },
    {
      id: 'dates',
      title: 'Fechas',
      icon: <Calendar className="text-green-500" />,
      description: 'Cálculos y extracciones de tiempo.',
      features: [
        { name: 'Inicio / Fin de Mes', desc: 'Transforma la fecha al primer o último día del mes correspondiente.' },
        { name: 'Extraer Partes', desc: 'Obtiene el Año, Mes, Día, Trimestre o Día de la Semana de una fecha.' },
        { name: 'Días desde hoy', desc: 'Calcula cuántos días han pasado desde la fecha hasta hoy (Antigüedad).' },
        { name: 'Sumar Días', desc: 'Agrega un número específico de días a la fecha.' }
      ]
    },
    {
      id: 'logic',
      title: 'Lógica',
      icon: <GitFork className="text-orange-500" />,
      description: 'Operaciones condicionales y booleanas.',
      features: [
        { name: 'Marcar Nulos', desc: 'Crea una columna True/False indicando si el valor original estaba vacío.' },
        { name: 'Columna Condicional', desc: 'Crea una nueva columna basada en una regla (Si X > 10 entonces "Alto" sino "Bajo").' },
        { name: 'Comparar Columnas', desc: 'Compara dos columnas fila por fila (Igual, Diferente).' },
        { name: 'Binning (Rangos)', desc: 'Agrupa números en rangos (ej: 0-10, 10-20...).' }
      ]
    },
    {
      id: 'tools',
      title: 'Herramientas',
      icon: <Calculator className="text-yellow-500" />,
      description: 'Matemáticas, filtros y utilidades varias.',
      features: [
        { name: 'Ordenar / Shuffle', desc: 'Ordena ascendente o aleatoriza el orden de las filas.' },
        { name: 'Filtrar', desc: 'Mantiene solo las filas que cumplen una condición (Contiene, Igual, Mayor que).' },
        { name: 'Cálculo (+ - * /)', desc: 'Operaciones matemáticas básicas entre dos columnas.' },
        { name: 'Z-Score / Normalizar', desc: 'Técnicas estadísticas para escalar datos numéricos.' },
        { name: 'Agrupar y Resumir', desc: 'Crea una tabla pivote simple: Agrupa por una columna y suma/promedia otra.' }
      ]
    }
  ]), [t]);

  const filteredDocs = DOCS_DATA.filter(cat => {
    if (activeCategory !== 'all' && cat.id !== activeCategory) return false;
    // Si hay búsqueda, busca dentro de las features o el título de la categoría
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCat = cat.title.toLowerCase().includes(term);
      const matchFeat = cat.features.some(f => 
        f.name.toLowerCase().includes(term) || f.desc.toLowerCase().includes(term)
      );
      return matchCat || matchFeat;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-carbon border-b border-gray-200 dark:border-wolf/10 p-6 shadow-sm z-10">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc flex items-center gap-2">
                <BookOpen className="text-persian" /> {t('docs.title')}
              </h1>
              <p className="text-gray-500 dark:text-wolf text-sm mt-1">{t('docs.subtitle')}</p>
            </div>
            
            {/* BUSCADOR */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder={t('docs.searchPlaceholder')} 
                className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-wolf/20 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-persian focus:ring-1 focus:ring-persian transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* FILTROS DE CATEGORÍA */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 custom-scrollbar">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap border ${activeCategory === 'all' ? 'bg-persian text-white border-persian' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-wolf/20 hover:border-persian/50'}`}
            >
              {t('docs.all')}
            </button>
            {DOCS_DATA.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap border ${activeCategory === cat.id ? 'bg-white dark:bg-carbon text-persian border-persian shadow-sm' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-wolf/20 hover:border-persian/50'}`}
              >
                {cat.icon} {cat.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
          
          {filteredDocs.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <p className="text-xl font-bold text-gray-500">{t('docs.noResultsTitle')}</p>
              <p className="text-sm">{t('docs.noResultsSubtitle')}</p>
            </div>
          )}

          {filteredDocs.map((cat) => (
            <div key={cat.id} className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 dark:border-wolf/10 pb-2">
                <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-wolf/10 shadow-sm">
                  {React.cloneElement(cat.icon, { size: 24 })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-zinc">{cat.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-wolf">{cat.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.features
                  .filter(f => !searchTerm || f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.desc.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((feat, idx) => (
                  <div key={idx} className="bg-white dark:bg-carbon-light p-4 rounded-xl border border-gray-200 dark:border-wolf/10 hover:border-persian/40 hover:shadow-md transition-all group">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-zinc mb-2 flex items-center justify-between">
                      {feat.name}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-persian transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300"/>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-wolf leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
