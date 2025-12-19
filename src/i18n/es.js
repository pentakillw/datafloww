export default {
  common: {
    cancel: 'Cancelar',
    accept: 'Aceptar',
    search: 'Buscar...',
    selectAll: '(Seleccionar todo)',
    addSelectionToFilter: 'Agregar la selección actual al filtro',
    noResults: 'Sin resultados'
  },
  docs: {
    title: 'Documentación',
    searchPlaceholder: 'Buscar función (ej: Trim)...',
    all: 'Todas',
    noResultsTitle: 'No se encontraron resultados',
    noResultsSubtitle: 'Intenta con otro término de búsqueda.',
    subtitle: 'Guía de referencia de todas las funciones de DataFlow Pro.'
  },
  docsCatalog: {
    smart: {
      title: 'Smart Clean',
      desc: 'Nuestra herramienta estrella. Realiza una limpieza automática de todo el dataset con un solo clic.',
      features: {
        autoClean: {
          name: 'Auto-Limpieza',
          desc: 'Ejecuta secuencialmente: 1) Elimina espacios en blanco (Trim) en textos. 2) Elimina filas completamente vacías. 3) Elimina filas duplicadas exactas.'
        }
      }
    },
    structure: {
      title: 'Estructura',
      desc: 'Herramientas para modificar la forma de la tabla (filas y columnas).',
      features: {
        promoteHeaders: {
          name: 'Promover Encabezados',
          desc: 'Convierte la primera fila de datos en los nombres de las columnas. Útil cuando importas CSVs sin header.'
        },
        addIndex: {
          name: 'Agregar Índice',
          desc: 'Crea una nueva columna al inicio con un número consecutivo (1, 2, 3...) para cada fila.'
        },
        duplicateColumn: {
          name: 'Duplicar Columna',
          desc: 'Crea una copia exacta de la columna seleccionada. Útil para guardar el original antes de transformarlo.'
        },
        dropTopRows: {
          name: 'Eliminar Filas Superiores',
          desc: 'Borra las primeras "N" filas de la tabla. Útil para eliminar títulos o metadatos basura al inicio de Excel.'
        },
        dropColumn: {
          name: 'Eliminar Columna',
          desc: 'Borra permanentemente la columna seleccionada.'
        }
      }
    }
  },
  filter: {
    sortAsc: 'A - Z',
    sortDesc: 'Z - A',
    duplicateColumn: 'Duplicar Columna',
    rename: 'Renombrar',
    changeType: 'Cambiar Tipo',
    moveColumn: 'Mover Columna',
    left: 'Izquierda',
    right: 'Derecha',
    transformText: 'Transformar Texto',
    fillDown: 'Rellenar Abajo',
    trimSpaces: 'Trim Espacios',
    stats: 'Estadísticas',
    dropColumn: 'Eliminar Columna'
  },
  layout: {
    menu: {
      dashboard: 'Dashboard',
      projects: 'Proyectos',
      data: 'Datos',
      transform: 'Transformar',
      analysis: 'Análisis',
      automation: 'Automatización',
      export: 'Exportar',
      landing: 'Landing Page',
      guide: 'Instalación',
      docs: 'Documentación'
    },
    tooltips: {
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      logout: 'Cerrar Sesión',
      collapse: 'Colapsar',
      expand: 'Expandir'
    },
    promo: {
      unlockPro: 'Desbloquea PRO',
      upgrade: 'Mejorar'
    },
    profile: {
      editProfile: 'Editar Perfil',
      change: 'Cambiar',
      fullName: 'Nombre Completo',
      avatarUrl: 'Avatar URL (Opcional)',
      note: 'Nota:',
      saveChanges: 'Guardar Cambios'
    }
  },
  export: {
    filesTab: '1. Archivos',
    connectorsTab: '2. Conectores',
    headerTitle: 'Export Hub',
    headerSubtitle: 'Descarga tus datos procesados o genera código de automatización.',
    planFreeLabel: 'Plan Free',
    planProLabel: 'Plan Pro',
    files: {
      csvTitle: 'CSV / Excel',
      csvDesc: 'Formato universal compatible.',
      csvRecommended: 'Recomendado',
      jsonTitle: 'JSON (API)',
      jsonDesc: 'Estructura ligera.'
    },
    connectors: {
      title: 'Webhook / API Push',
      desc: 'Envía tus datos transformados (JSON) directamente a Zapier, Make, o tu propio servidor.',
      endpointLabel: 'Endpoint URL',
      sending: 'Enviando...',
      send: 'Enviar',
      upcoming: 'Próximamente',
      gsheets: 'Google Sheets',
      postgres: 'PostgreSQL / Supabase'
    },
    sql: {
      copy: 'Copiar SQL',
      copied: 'Copiado'
    },
    emptyData: 'Carga datos primero.'
  },
  projects: {
    title: 'Gestión de Proyectos',
    subtitle: 'Organiza tus archivos en espacios de trabajo dedicados.',
    newProject: 'Nuevo Proyecto',
    searchPlaceholder: 'Buscar proyectos...',
    emptyTitle: 'No hay proyectos',
    emptySubtitle: 'Crea tu primer proyecto para empezar a organizar.',
    filesSynced: 'Archivos sincronizados correctamente',
    reloadFilesTooltip: 'Recargar archivos',
    createdLabel: 'Creado',
    projectFilesTitle: 'Archivos del Proyecto',
    dragHint: 'Arrastra archivos aquí o usa el Workspace',
    projectEmptyTitle: 'Este proyecto está vacío.',
    projectEmptySubtitle: 'Asigna archivos desde el Workspace.',
    removeFileFromProjectConfirm: '¿Quitar archivo del proyecto?',
    rowsLabel: 'filas',
    noDescription: 'Sin descripción',
    filesCountLabel: 'archivos',
    edit: 'Editar',
    delete: 'Eliminar',
    deleteConfirm: '¿Eliminar proyecto? Se desvincularán los archivos.'
  },
  workspace: {
    duplicateFileDetected: 'Archivo Duplicado Detectado',
    deleteFile: 'Eliminar Archivo',
    uploadHint: 'Sube archivos CSV o Excel (.xlsx).',
    selectFile: 'Seleccionar Archivo',
    trash: 'Papelera',
    myFiles: 'Mis Archivos',
    viewFiles: 'Ver Archivos',
    viewTrash: 'Ver Papelera',
    searchPlaceholder: 'Buscar archivo o proyecto...',
    filtersTooltip: 'Filtros Avanzados',
    previewReadOnly: 'VISTA PREVIA (Solo lectura)',
    creditsUsedLabel: 'Créditos Usados:'
  },
  guide: {
    downloadPython: 'Descargar Python',
    duringInstall: 'Durante la instalación:',
    readyTitle: '¡Todo listo!',
    headerTitle: 'Guía de Ejecución',
    headerSubtitle: 'Para ejecutar los scripts generados por NoCodePY en tu computadora, necesitas preparar tu entorno una única vez. Sigue estos 3 pasos.',
    step1Title: 'Instalar Python',
    step1Desc: 'Es el motor que hace funcionar el código. Sin él, tu computadora no entenderá el archivo .py.',
    importantBadge: 'MUY IMPORTANTE',
    addPath: 'En la primera pantalla del instalador, debes marcar la casilla que dice:',
    installNow: 'Luego haz clic en "Install Now" y espera a que termine.',
    step2Title: 'Visual Studio Code',
    step2Desc: 'El editor de código estándar mundial. Aquí abrirás y ejecutarás tu script.',
    downloadVSCode: 'Descargar VS Code',
    quickSetup: 'Configuración rápida:',
    step2Item1: 'Instala y abre VS Code.',
    step2Item2: 'Ve al icono de extensiones (cuadritos a la izquierda).',
    step2Item3: 'Busca "Python" (creada por Microsoft) e instálala.',
    step2Item4: 'Esto habilitará el botón de "Play" para ejecutar tu código.',
    step3Title: 'Instalar Librerías',
    step3Desc: 'Tu script necesita herramientas especiales (Pandas, OpenPyXL) para leer Excel. Instálalas con un comando.',
    terminalLabel: 'Terminal (CMD o PowerShell)',
    copy: 'Copiar',
    copied: 'Copiado',
    runOnceNote: 'Solo necesitas ejecutar esto una vez en tu terminal.',
    readySteps1: 'Descarga tu script desde Export Hub.',
    readySteps2: 'Abre el archivo .py con VS Code.',
    readySteps3: 'Presiona el botón de Play (▷) en la esquina superior derecha.',
    readySteps4: '¡Tu aplicación automática se abrirá en una ventana nueva!'
  },
  studio: {
    noDataTitle: 'Sin datos cargados',
    noDataSubtitle: 'Ve a la pestaña "Datos" para cargar un archivo.',
    historyTitle: 'Historial de Acciones',
    historyEmpty: 'Sin cambios recientes',
    historyDeleteStep: 'Eliminar este paso',
    showingRows: 'Mostrando',
    columnLabel: 'Columna',
    top: {
      addColumn: 'Agregar Columna',
      structure: 'Transformar',
      cleaning: 'Limpieza',
      textDate: 'Texto/Fecha',
      calc: 'Cálculo',
      ds: 'Data Science'
    },
    toolbar: {
      text: 'Texto',
      date: 'Fecha',
      removeDuplicates: 'Quitar Duplicados',
      removeDuplicatesTooltip: 'Eliminar Duplicados Global'
    },
    customColTitle: 'Columna Personalizada',
    customColNameLabel: 'Nombre de la nueva columna',
    customColFormulaLabel: 'Fórmula de columna personalizada',
    selectColumn: 'Selecciona columna',
    patternLabel: 'Patrón',
    examplesHint: 'Escribe al menos 1 o 2 ejemplos...',
    prompts: {
      find: 'Buscar:',
      replaceWith: 'Reemplazar con:',
      regexPattern: 'Patrón Regex (ej: \\d+):',
      daysToAdd: 'Días a sumar (negativo para restar):',
      monthsToAdd: 'Meses a sumar:',
      decimals: 'Decimales:',
      exponent: 'Exponente:',
      divisor: 'Divisor:'
    }
    ,
    menu: {
      sections: {
        general: 'General',
        conditionalStructure: 'Condicional y Estructura',
        table: 'Tabla',
        actions: 'Acciones',
        text: 'Texto',
        charFilter: 'Filtro de Caracteres',
        values: 'Valores',
        dates: 'Fechas',
        advanced: 'Avanzado'
      },
      examplesColumn: 'Columna a partir de los ejemplos',
      customColumn: 'Columna personalizada',
      conditionalColumn: 'Columna condicional',
      indexColumn: 'Columna de índice',
      duplicateColumn: 'Duplicar columna',
      promoteHeaders: 'Promover Encabezados',
      removeTopRows: 'Eliminar Filas Sup...',
      dropColumn: 'Eliminar Columna',
      renameColumn: 'Renombrar Columna...',
      changeType: 'Cambiar Tipo de Dato...',
      trimSpaces: 'Trim (Espacios)',
      normalizeSpaces: 'Normalizar Espacios',
      cleanSymbols: 'Limpiar Símbolos',
      removeHtml: 'Quitar HTML',
      titleCase: 'Nombre Propio',
      onlyNumbers: 'Solo Números',
      onlyLetters: 'Solo Letras',
      removeDuplicates: 'Eliminar Duplicados',
      fillDown: 'Rellenar Abajo (Fill)',
      fillNulls: 'Rellenar Nulos...',
      textLength: 'Longitud',
      reverseText: 'Invertir',
      splitColumn: 'Dividir Columna',
      mergeColumns: 'Unir Columnas',
      replaceValue: 'Reemplazar Valor',
      extractRegexSubstr: 'Extraer (Regex/Substr)',
      extractDatePart: 'Extraer Año/Mes/Día',
      dayOfWeek: 'Día de Semana',
      quarter: 'Trimestre',
      addDaysMonths: 'Sumar Días/Meses...',
      mathOps: 'Operar (+ - * /)...',
      absRound: 'Absoluto/Redondeo...',
      groupPivot: 'Agrupar (Pivot)...',
      stats: 'Estadísticas',
      zscore: 'Z-Score (Anomalías)',
      normalize01: 'Normalizar (0-1)',
      oneHot: 'One-Hot Encoding',
      smartClean: 'Limpieza Inteligente',
      uppercase: 'MAYÚSCULAS',
      lowercase: 'minúsculas',
      extractYear: 'Extraer Año',
      extractMonth: 'Extraer Mes',
      addDays: 'Sumar Días...',
      addMonths: 'Sumar Meses...',
      round: 'Redondear...',
      absoluteValue: 'Valor Absoluto',
      floor: 'Parte Entera (Floor)',
      ceil: 'Techo (Ceil)',
      sqrt: 'Raíz Cuadrada',
      log: 'Logaritmo Natural',
      power: 'Potencia...',
      mod: 'Módulo...'
    },
    history: {
      delete: 'Eliminar',
      filter: 'Filtro',
      reorderCols: 'Reordenar columnas',
      smartClean: 'Limpieza Inteligente',
      rename: 'Renombrar',
      trim: 'Trim',
      fillDown: 'Rellenar abajo',
      cleanSymbols: 'Limpiar símbolos',
      normalizeSpaces: 'Normalizar espacios',
      removeHtml: 'Quitar HTML',
      onlyNumbers: 'Solo números',
      onlyLetters: 'Solo letras',
      length: 'Longitud',
      reverse: 'Invertir',
      removeDuplicates: 'Eliminar duplicados',
      changeType: 'Cambiar tipo',
      addIndex: 'Agregar índice',
      fillNulls: 'Rellenar nulos',
      impute: 'Imputar',
      split: 'Dividir',
      merge: 'Unir',
      addAffix: 'Agregar',
      substr: 'Substr',
      regex: 'Regex',
      calc: 'Calc',
      calcAdvanced: 'Cálculo avanzado',
      addDays: 'Sumar días',
      addMonths: 'Sumar meses',
      dayOfWeekShort: 'Día de semana',
      quarter: 'Trimestre',
      extractPart: 'Extraer',
      smartColumn: 'Columna Inteligente',
      prefix: 'Prefijo',
      suffix: 'Sufijo',
      case: 'Case'
    }
  },
  analysis: {
    noDataTitle: 'Sin datos para analizar',
    noDataSubtitle: 'Carga un archivo en la sección "Datos" primero.',
    headerTitle: 'Reporte de Análisis',
    headerSubtitle: 'Diagnóstico automático de calidad y patrones de datos.',
    qualityLabel: 'Calidad del Dataset:',
    kpis: {
      totalRows: 'Total Filas',
      totalCols: 'Total Columnas',
      emptyCells: 'Celdas Vacías',
      textFields: 'Campos de Texto',
      needsCleaning: 'Requiere limpieza',
      datasetClean: 'Dataset limpio'
    },
    charts: {
      frequencyDistTitle: 'Distribución de Frecuencia',
      columnLabel: 'Columna:',
      dataStructureTitle: 'Estructura de Datos',
      numericTrendTitle: 'Análisis de Tendencia Numérica',
      colsShort: 'Cols'
    }
  },
  landing: {
    nav: {
      hello: 'Hola,',
      toDashboard: 'Ir al Dashboard',
      signIn: 'Iniciar Sesión',
      createAccount: 'Crear Cuenta'
    },
    hero: {
      badge: 'Tu programador Senior de Python virtual',
      title1: 'Automatiza Excel y Datos',
      title2Highlight: 'sin escribir una línea de código.',
      desc: 'Sube tus archivos, límpialos visualmente con herramientas inteligentes y exporta automáticamente una App de Python (Tkinter) lista para usar. El poder de Pandas, la facilidad de un clic.',
      primaryButtonLoggedIn: 'Ir a mi Espacio',
      primaryButtonLoggedOut: 'Empezar Gratis',
      viewGeneratedCode: 'Ver Código Generado'
    },
    how: {
      title: '¿Cómo funciona NoCodePY?',
      subtitle: 'Tres pasos simples para convertir datos crudos en automatización pura.',
      step1: {
        title: 'Sube tus Datos',
        desc: 'Arrastra tus archivos Excel, CSV o JSON. Nuestro motor los analiza al instante detectando tipos y estructuras.'
      },
      step2: {
        title: 'Transforma Visualmente',
        desc: 'Aplica filtros, limpieza inteligente y fórmulas con clics. Mira los cambios en tiempo real sin escribir código.'
      },
      step3: {
        title: 'Exporta tu App',
        desc: 'Descarga un script Python (.py) independiente o una aplicación ejecutable (.exe) para compartir con tu equipo.'
      }
    },
    core: {
      title: 'De Caos a Código en segundos',
      desc: 'NoCodePY entiende tus datos. Usa nuestro motor "Smart Clean" para detectar anomalías o enséñale al sistema con ejemplos y él deducirá la fórmula.',
      features: {
        smartClean: {
          title: 'Limpieza Inteligente',
          desc: 'Detecta nulos, espacios y formatos mixtos automáticamente.'
        },
        colByExample: {
          title: 'Columna por Ejemplos',
          desc: 'Tú escribes el resultado deseado, NoCodePY deduce la lógica (Regex/Split/Merge).'
        },
        nativeExport: {
          title: 'Exportación Nativa',
          desc: 'Te entregamos el script .py con interfaz gráfica incluida.'
        }
      }
    },
    cta: {
      title: 'Deja de sufrir con Excel y Macros',
      desc: 'Únete a la evolución del ETL. Limpia datos visualmente y obtén la potencia de Python sin la curva de aprendizaje.',
      createAccount: 'Crear Cuenta Gratis',
      readDocs: 'Leer Documentación'
    },
    footer: {
      product: 'Producto',
      legal: 'Legal',
      items: {
        transformer: 'Transformador',
        smartClean: 'Smart Clean',
        pythonExport: 'Python Export',
        terms: 'Términos de Uso',
        privacy: 'Privacidad'
      },
      copyright: '© 2025 NoCodePY. Todos los derechos reservados.'
    },
    cards: {
      title: 'Todo lo que necesitas para dominar tus datos',
      subtitle: 'Ya seas analista de datos, contable o desarrollador buscando ahorrar tiempo, NoCodePY tiene las herramientas.',
      ai: {
        title: 'IA & Heurística',
        desc: 'Motor "Smart Clean" y "Columna por Ejemplos". No necesitas saber expresiones regulares, el sistema las deduce por ti.'
      },
      code: {
        title: 'Código Real',
        desc: 'No te encerramos en nuestra plataforma. Exporta código Python limpio y documentado para usarlo donde quieras.'
      },
      analysis: {
        title: 'Análisis Visual',
        desc: 'Dashboards automáticos que analizan la calidad de tus datos, detectan nulos y muestran distribuciones al instante.'
      },
      massive: {
        title: 'Soporte Masivo',
        desc: 'Maneja archivos CSV y Excel de gran tamaño sin bloquear tu navegador gracias a nuestra carga optimizada.'
      },
      transform: {
        title: 'Transformación Visual',
        desc: 'Más de 50 operaciones disponibles: Filtros, Math, Fechas, JSON Extract, One-Hot Encoding y más.'
      },
      sql: {
        title: 'SQL Generator',
        desc: '¿Necesitas subir los datos a una base de datos? Generamos los scripts "CREATE TABLE" e "INSERT" automáticamente.'
      }
    }
  },
  billing: {
    backToDashboard: 'Volver al Dashboard',
    title: 'Pasarela de Pago PRO',
    subtitle: 'Simulación de integración con Stripe para el plan PRO.',
    planTitle: 'Plan NoCodePY PRO',
    perMonth: '/ mes',
    features: {
      unlimitedExport: 'Exportación de código Python ilimitada',
      extendedLimits: 'Límites de carga de datos extendidos',
      prioritySupport: 'Acceso a soporte prioritario'
    },
    payButton: 'Proceder al Pago (Simulado)'
  },
  automation: {
    title: 'Automatización',
    subtitle: 'Crea reglas y procesa archivos en lote.',
    tabs: {
      rules: 'Mis Reglas',
      batch: 'Procesar Lote'
    },
    newRule: 'Nueva Regla',
    emptyTitle: 'No hay reglas definidas',
    emptySubtitle: 'Crea tu primera regla para automatizar tareas repetitivas.',
    localTransformTitle: 'Transformación Local',
    localTransformDesc: 'Tus datos no salen de tu navegador. El procesamiento utiliza la potencia de tu dispositivo para máxima privacidad y velocidad.',
    unifiedDownloadTitle: 'Descarga Unificada',
    unifiedDownloadDesc: 'Obtén todos tus archivos procesados en un único archivo ZIP organizado, listo para compartir o archivar.',
    batch: {
      massiveTitle: 'Procesamiento Masivo',
      massiveDesc: 'Sube hasta 50 archivos simultáneamente. El sistema aplicará las transformaciones seleccionadas a cada uno de forma independiente.'
    },
    rule: {
      ifThis: 'Si ocurre esto:',
      onUpload: 'Al subir archivo',
      condition: 'Condición',
      filenameContains: 'Nombre contiene',
      doThis: 'Hacer esto:',
      autoClean: 'Limpieza Inteligente',
      convertTo: 'Convertir a',
      onUploadOption: 'Al subir un archivo'
    },
    modal: {
      editTitle: 'Editar Regla',
      newTitle: 'Nueva Automatización',
      nameLabel: 'Nombre de la Regla',
      namePlaceholder: 'Ej: Procesar Reportes de Ventas',
      triggerLabel: 'Disparador'
    }
  },
  terms: {
    headerTitle: 'Términos y Condiciones de Uso',
    section1Title: '1. Aceptación y Restricciones',
    section1Text: 'Bienvenido a DataFlow Pro. Al utilizar nuestro software, aceptas que este servicio es una herramienta SaaS de procesamiento de datos. Queda estrictamente prohibido utilizar esta plataforma para procesar bases de datos obtenidas ilegalmente, realizar fraudes o cualquier actividad ilícita.',
    section2Title: '2. Propiedad Intelectual y Prohibición de Reventa',
    section2Intro: 'El código fuente generado por DataFlow Pro (scripts de Python, archivos ejecutables o SQL) es propiedad intelectual de [TU EMPRESA/NOMBRE] y se licencia al usuario únicamente para uso interno y personal.',
    bullets: {
      resale: '⛔ ESTÁ PROHIBIDO revender, sublicenciar o distribuir los scripts generados como productos propios.',
      watermark: '⛔ ESTÁ PROHIBIDO eliminar las marcas de agua, comentarios de copyright o huellas digitales del código exportado.',
      competitor: '⛔ ESTÁ PROHIBIDO utilizar nuestro motor para crear un servicio SaaS competidor.'
    },
    section3Title: '3. Limitación de Responsabilidad (El Escudo)'
  },
  privacy: {
    headerTitle: 'Aviso de Privacidad',
    section1Title: '1. Datos que Recabamos',
    section1Intro: 'En DataFlow Pro (operado por [TU EMPRESA/NOMBRE]), nos tomamos muy en serio tu privacidad. Solo recolectamos:',
    section1Item1: 'Información de registro (correo electrónico y contraseña encriptada).',
    section1Item2: 'Archivos cargados temporalmente para su procesamiento.',
    section1Item3: 'Logs de actividad técnica para seguridad del sistema.',
    section2Title: '2. Uso de tus Archivos',
    section2Text: 'Tus archivos CSV/Excel son procesados de forma privada. NO vendemos, compartimos ni leemos el contenido de tus datos. El procesamiento es automatizado y los archivos temporales se eliminan periódicamente de nuestros servidores.',
    section3Title: '3. Derechos ARCO',
    section3Text: 'Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos. Para ejercer estos derechos o solicitar la eliminación completa de tu cuenta, contacta a: [TU CORREO DE SOPORTE].',
    footerNote: 'Este aviso cumple con las normativas de protección de datos vigentes.'
  },
  dashboard: {
    hero: {
      greeting: 'Hola, Analista',
      freeHint: 'Actualiza para eliminar límites.',
      proHint: 'Acceso total.',
      proBadge: 'PRO',
      freeBadge: 'FREE'
    },
    limits: {
      filesLabel: 'ARCHIVOS'
    },
    stats: {
      records: 'REGISTROS',
      dataQuality: 'CALIDAD DE DATOS',
      emptyCells: 'vacíos',
      projects: 'PROYECTOS',
      dimensions: 'DIMENSIONES',
      colsShort: 'Columnas',
      lastFile: 'ÚLTIMO ARCHIVO',
      none: 'Ninguno',
      transforms: 'TRANSFORMACIONES'
    },
    sections: {
      preparation: 'Preparación',
      workflow: 'Flujo de Trabajo'
    },
    prep: {
      guide: {
        title: 'Guía de Ejecución',
        desc: 'Python local y scripts.',
        cta: 'Ver pasos'
      },
      docs: {
        title: 'Documentación',
        desc: 'API y funciones.',
        cta: 'Explorar'
      }
    },
    actions: {
      uploadTitle: 'Cargar',
      uploadDesc: 'Importa datos',
      transformTitle: 'Transformar',
      transformDesc: 'Limpia/Edita',
      exportTitle: 'Exportar',
      exportDesc: 'Descargar',
      wait: 'Espera...',
      open: 'Abrir'
    }
  }
}
