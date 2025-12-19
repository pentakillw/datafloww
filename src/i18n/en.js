export default {
  common: {
    cancel: 'Cancel',
    accept: 'Accept',
    search: 'Search...',
    selectAll: 'Select all',
    addSelectionToFilter: 'Add current selection to filter',
    noResults: 'No results'
  },
  docs: {
    title: 'Documentation',
    searchPlaceholder: 'Search function (e.g., Trim)...',
    all: 'All',
    noResultsTitle: 'No results found',
    noResultsSubtitle: 'Try another search term.',
    subtitle: 'Reference guide for all DataFlow Pro functions.'
  },
  docsCatalog: {
    smart: {
      title: 'Smart Clean',
      desc: 'Our flagship tool. Cleans the entire dataset automatically with one click.',
      features: {
        autoClean: {
          name: 'Auto-Clean',
          desc: 'Runs sequentially: 1) Trim whitespace in text. 2) Remove completely empty rows. 3) Remove exact duplicate rows.'
        }
      }
    },
    structure: {
      title: 'Structure',
      desc: 'Tools to modify the shape of the table (rows and columns).',
      features: {
        promoteHeaders: {
          name: 'Promote Headers',
          desc: 'Turn the first data row into column names. Useful when importing CSVs without header.'
        },
        addIndex: {
          name: 'Add Index',
          desc: 'Create a new column at the beginning with a consecutive number (1, 2, 3...) for each row.'
        },
        duplicateColumn: {
          name: 'Duplicate Column',
          desc: 'Create an exact copy of the selected column. Useful to keep the original before transforming.'
        },
        dropTopRows: {
          name: 'Remove Top Rows',
          desc: 'Delete the first "N" rows of the table. Useful to remove titles or junk metadata at the top of Excel.'
        },
        dropColumn: {
          name: 'Delete Column',
          desc: 'Permanently delete the selected column.'
        }
      }
    }
  },
  filter: {
    sortAsc: 'A - Z',
    sortDesc: 'Z - A',
    duplicateColumn: 'Duplicate Column',
    rename: 'Rename',
    changeType: 'Change Type',
    moveColumn: 'Move Column',
    left: 'Left',
    right: 'Right',
    transformText: 'Transform Text',
    fillDown: 'Fill Down',
    trimSpaces: 'Trim Spaces',
    stats: 'Statistics',
    dropColumn: 'Delete Column'
  },
  layout: {
    menu: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      data: 'Data',
      transform: 'Transform',
      analysis: 'Analysis',
      automation: 'Automation',
      export: 'Export',
      landing: 'Landing Page',
      guide: 'Setup Guide',
      docs: 'Docs'
    },
    tooltips: {
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      logout: 'Log out',
      collapse: 'Collapse',
      expand: 'Expand'
    },
    promo: {
      unlockPro: 'Unlock PRO',
      upgrade: 'Upgrade'
    },
    profile: {
      editProfile: 'Edit Profile',
      change: 'Change',
      fullName: 'Full Name',
      avatarUrl: 'Avatar URL (Optional)',
      note: 'Note:',
      saveChanges: 'Save Changes'
    }
  },
  export: {
    filesTab: '1. Files',
    connectorsTab: '2. Connectors',
    headerTitle: 'Export Hub',
    headerSubtitle: 'Download your processed data or generate automation code.',
    planFreeLabel: 'Free Plan',
    planProLabel: 'Pro Plan',
    files: {
      csvTitle: 'CSV / Excel',
      csvDesc: 'Universal compatible format.',
      csvRecommended: 'Recommended',
      jsonTitle: 'JSON (API)',
      jsonDesc: 'Lightweight structure.'
    },
    connectors: {
      title: 'Webhook / API Push',
      desc: 'Send your transformed data (JSON) directly to Zapier, Make, or your own server.',
      endpointLabel: 'Endpoint URL',
      sending: 'Sending...',
      send: 'Send',
      upcoming: 'Coming soon',
      gsheets: 'Google Sheets',
      postgres: 'PostgreSQL / Supabase'
    },
    sql: {
      copy: 'Copy SQL',
      copied: 'Copied'
    },
    emptyData: 'Load data first.'
  },
  projects: {
    title: 'Project Management',
    subtitle: 'Organize your files into dedicated workspaces.',
    newProject: 'New Project',
    searchPlaceholder: 'Search projects...',
    emptyTitle: 'No projects',
    emptySubtitle: 'Create your first project to start organizing.',
    filesSynced: 'Files synced successfully',
    reloadFilesTooltip: 'Reload files',
    createdLabel: 'Created',
    projectFilesTitle: 'Project Files',
    dragHint: 'Drag files here or use the Workspace',
    projectEmptyTitle: 'This project is empty.',
    projectEmptySubtitle: 'Assign files from the Workspace.',
    removeFileFromProjectConfirm: 'Remove file from project?',
    rowsLabel: 'rows',
    noDescription: 'No description',
    filesCountLabel: 'files',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Delete project? Files will be unlinked.'
  },
  workspace: {
    duplicateFileDetected: 'Duplicate File Detected',
    deleteFile: 'Delete File',
    uploadHint: 'Upload CSV or Excel (.xlsx) files.',
    selectFile: 'Select File',
    trash: 'Trash',
    myFiles: 'My Files',
    viewFiles: 'View Files',
    viewTrash: 'View Trash',
    searchPlaceholder: 'Search file or project...',
    filtersTooltip: 'Advanced Filters',
    previewReadOnly: 'PREVIEW (Read-only)',
    creditsUsedLabel: 'Credits Used:'
  },
  guide: {
    downloadPython: 'Download Python',
    duringInstall: 'During installation:',
    readyTitle: 'All set!',
    headerTitle: 'Run Guide',
    headerSubtitle: 'To run the scripts generated by NoCodePY on your computer, prepare your environment once. Follow these 3 steps.',
    step1Title: 'Install Python',
    step1Desc: 'It is the engine that runs the code. Without it, your computer will not understand the .py file.',
    importantBadge: 'VERY IMPORTANT',
    addPath: 'On the first installer screen, you must check the box that says:',
    installNow: 'Then click "Install Now" and wait for it to finish.',
    step2Title: 'Visual Studio Code',
    step2Desc: 'The world standard code editor. Here you will open and run your script.',
    downloadVSCode: 'Download VS Code',
    quickSetup: 'Quick setup:',
    step2Item1: 'Install and open VS Code.',
    step2Item2: 'Go to the extensions icon (squares on the left).',
    step2Item3: 'Search for "Python" (made by Microsoft) and install it.',
    step2Item4: 'This will enable the "Play" button to run your code.',
    step3Title: 'Install Libraries',
    step3Desc: 'Your script needs special tools (Pandas, OpenPyXL) to read Excel. Install them with one command.',
    terminalLabel: 'Terminal (CMD or PowerShell)',
    copy: 'Copy',
    copied: 'Copied',
    runOnceNote: 'You only need to run this once in your terminal.',
    readySteps1: 'Download your script from Export Hub.',
    readySteps2: 'Open the .py file with VS Code.',
    readySteps3: 'Press the Play (▷) button in the top-right corner.',
    readySteps4: 'Your automated app will open in a new window!'
  },
  studio: {
    noDataTitle: 'No data loaded',
    noDataSubtitle: 'Go to the "Data" tab to load a file.',
    historyTitle: 'Action History',
    historyEmpty: 'No recent changes',
    historyDeleteStep: 'Delete this step',
    showingRows: 'Showing',
    columnLabel: 'Column',
    top: {
      addColumn: 'Add Column',
      structure: 'Transform',
      cleaning: 'Cleaning',
      textDate: 'Text/Date',
      calc: 'Calculation',
      ds: 'Data Science'
    },
    toolbar: {
      text: 'Text',
      date: 'Date',
      removeDuplicates: 'Remove Duplicates',
      removeDuplicatesTooltip: 'Remove Global Duplicates'
    },
    customColTitle: 'Custom Column',
    customColNameLabel: 'New column name',
    customColFormulaLabel: 'Custom column formula',
    selectColumn: 'Select a column',
    patternLabel: 'Pattern',
    examplesHint: 'Type at least 1 or 2 examples...',
    prompts: {
      find: 'Find:',
      replaceWith: 'Replace with:',
      regexPattern: 'Regex pattern (e.g., \\d+):',
      daysToAdd: 'Days to add (negative to subtract):',
      monthsToAdd: 'Months to add:',
      decimals: 'Decimals:',
      exponent: 'Exponent:',
      divisor: 'Divisor:'
    },
    menu: {
      sections: {
        general: 'General',
        conditionalStructure: 'Conditional & Structure',
        table: 'Table',
        actions: 'Actions',
        text: 'Text',
        charFilter: 'Character Filter',
        values: 'Values',
        dates: 'Dates',
        advanced: 'Advanced'
      },
      examplesColumn: 'Column from examples',
      customColumn: 'Custom column',
      conditionalColumn: 'Conditional column',
      indexColumn: 'Index column',
      duplicateColumn: 'Duplicate column',
      promoteHeaders: 'Promote Headers',
      removeTopRows: 'Remove Top Rows...',
      dropColumn: 'Delete Column',
      renameColumn: 'Rename Column...',
      changeType: 'Change Data Type...',
      trimSpaces: 'Trim Spaces',
      normalizeSpaces: 'Normalize Spaces',
      cleanSymbols: 'Clean Symbols',
      removeHtml: 'Remove HTML',
      titleCase: 'Title Case',
      onlyNumbers: 'Only Numbers',
      onlyLetters: 'Only Letters',
      removeDuplicates: 'Remove Duplicates',
      fillDown: 'Fill Down',
      fillNulls: 'Fill Nulls...',
      textLength: 'Length',
      reverseText: 'Reverse',
      splitColumn: 'Split Column',
      mergeColumns: 'Merge Columns',
      replaceValue: 'Replace Value',
      extractRegexSubstr: 'Extract (Regex/Substr)',
      extractDatePart: 'Extract Year/Month/Day',
      dayOfWeek: 'Day of Week',
      quarter: 'Quarter',
      addDaysMonths: 'Add Days/Months...',
      mathOps: 'Operate (+ - * /)...',
      absRound: 'Absolute/Round...',
      groupPivot: 'Group (Pivot)...',
      stats: 'Statistics',
      zscore: 'Z-Score (Anomalies)',
      normalize01: 'Normalize (0-1)',
      oneHot: 'One-Hot Encoding',
      smartClean: 'Smart Clean',
      uppercase: 'UPPERCASE',
      lowercase: 'lowercase',
      extractYear: 'Extract Year',
      extractMonth: 'Extract Month',
      addDays: 'Add Days...',
      addMonths: 'Add Months...',
      round: 'Round...',
      absoluteValue: 'Absolute Value',
      floor: 'Floor (Integer Part)',
      ceil: 'Ceil',
      sqrt: 'Square Root',
      log: 'Natural Logarithm',
      power: 'Power...',
      mod: 'Modulo...'
    },
    history: {
      delete: 'Delete',
      filter: 'Filter',
      reorderCols: 'Reorder columns',
      smartClean: 'Smart Clean',
      rename: 'Rename',
      trim: 'Trim',
      fillDown: 'Fill Down',
      cleanSymbols: 'Clean symbols',
      normalizeSpaces: 'Normalize spaces',
      removeHtml: 'Remove HTML',
      onlyNumbers: 'Only numbers',
      onlyLetters: 'Only letters',
      length: 'Length',
      reverse: 'Reverse',
      removeDuplicates: 'Remove duplicates',
      changeType: 'Change type',
      addIndex: 'Add index',
      fillNulls: 'Fill nulls',
      impute: 'Impute',
      split: 'Split',
      merge: 'Merge',
      addAffix: 'Add',
      substr: 'Substr',
      regex: 'Regex',
      calc: 'Calc',
      calcAdvanced: 'Advanced calc',
      addDays: 'Add days',
      addMonths: 'Add months',
      dayOfWeekShort: 'Day of week',
      quarter: 'Quarter',
      extractPart: 'Extract',
      smartColumn: 'Smart Column',
      prefix: 'Prefix',
      suffix: 'Suffix',
      case: 'Case'
    }
  },
  analysis: {
    noDataTitle: 'No data to analyze',
    noDataSubtitle: 'Load a file in the "Data" section first.',
    headerTitle: 'Analysis Report',
    headerSubtitle: 'Automatic diagnosis of data quality and patterns.',
    qualityLabel: 'Dataset Quality:',
    kpis: {
      totalRows: 'Total Rows',
      totalCols: 'Total Columns',
      emptyCells: 'Empty Cells',
      textFields: 'Text Fields',
      needsCleaning: 'Needs cleaning',
      datasetClean: 'Dataset clean'
    },
    charts: {
      frequencyDistTitle: 'Frequency Distribution',
      columnLabel: 'Column:',
      dataStructureTitle: 'Data Structure',
      numericTrendTitle: 'Numeric Trend Analysis',
      colsShort: 'Cols'
    }
  },
  landing: {
    nav: {
      hello: 'Hi,',
      toDashboard: 'Go to Dashboard',
      signIn: 'Sign In',
      createAccount: 'Create Account'
    },
    hero: {
      badge: 'Your virtual Senior Python developer',
      title1: 'Automate Excel and Data',
      title2Highlight: 'without writing a single line of code.',
      desc: 'Upload your files, clean them visually with smart tools, and automatically export a Python App (Tkinter) ready to use. The power of Pandas, the ease of a click.',
      primaryButtonLoggedIn: 'Go to my Space',
      primaryButtonLoggedOut: 'Start Free',
      viewGeneratedCode: 'View Generated Code'
    },
    how: {
      title: 'How does NoCodePY work?',
      subtitle: 'Three simple steps to turn raw data into pure automation.',
      step1: {
        title: 'Upload your Data',
        desc: 'Drag your Excel, CSV or JSON files. Our engine analyzes them instantly, detecting types and structures.'
      },
      step2: {
        title: 'Transform Visually',
        desc: 'Apply filters, smart cleaning and formulas with clicks. See changes in real time without writing code.'
      },
      step3: {
        title: 'Export your App',
        desc: 'Download a standalone Python script (.py) or an executable app (.exe) to share with your team.'
      }
    },
    core: {
      title: 'From Chaos to Code in seconds',
      desc: 'NoCodePY understands your data. Use our "Smart Clean" engine to detect anomalies, or teach the system with examples and it will deduce the formula.',
      features: {
        smartClean: {
          title: 'Smart Clean',
          desc: 'Automatically detects nulls, spaces and mixed formats.'
        },
        colByExample: {
          title: 'Column by Examples',
          desc: 'You write the desired result; NoCodePY deduces the logic (Regex/Split/Merge).'
        },
        nativeExport: {
          title: 'Native Export',
          desc: 'We deliver the .py script with included GUI.'
        }
      }
    },
    cta: {
      title: 'Stop suffering with Excel and Macros',
      desc: 'Join the evolution of ETL. Clean data visually and get the power of Python without the learning curve.',
      createAccount: 'Create Free Account',
      readDocs: 'Read Documentation'
    },
    footer: {
      product: 'Product',
      legal: 'Legal',
      items: {
        transformer: 'Transformer',
        smartClean: 'Smart Clean',
        pythonExport: 'Python Export',
        terms: 'Terms of Use',
        privacy: 'Privacy'
      },
      copyright: '© 2025 NoCodePY. All rights reserved.'
    },
    cards: {
      title: 'Everything you need to master your data',
      subtitle: 'Whether you are a data analyst, accountant or developer looking to save time, NoCodePY has the tools.',
      ai: {
        title: 'AI & Heuristics',
        desc: '“Smart Clean” engine and “Column by Examples”. No need to know regular expressions; the system deduces them for you.'
      },
      code: {
        title: 'Real Code',
        desc: 'We don’t lock you in. Export clean, documented Python code to use anywhere.'
      },
      analysis: {
        title: 'Visual Analysis',
        desc: 'Automatic dashboards that analyze data quality, detect nulls and show distributions instantly.'
      },
      massive: {
        title: 'Massive Support',
        desc: 'Handle large CSV and Excel files without blocking your browser thanks to optimized loading.'
      },
      transform: {
        title: 'Visual Transformation',
        desc: '50+ operations: Filters, Math, Dates, JSON Extract, One-Hot Encoding and more.'
      },
      sql: {
        title: 'SQL Generator',
        desc: 'Need to load data into a database? We generate “CREATE TABLE” and “INSERT” scripts automatically.'
      }
    }
  },
  billing: {
    backToDashboard: 'Back to Dashboard',
    title: 'PRO Payment Gateway',
    subtitle: 'Stripe integration simulation for the PRO plan.',
    planTitle: 'NoCodePY PRO Plan',
    perMonth: '/ month',
    features: {
      unlimitedExport: 'Unlimited Python code exports',
      extendedLimits: 'Extended data upload limits',
      prioritySupport: 'Access to priority support'
    },
    payButton: 'Proceed to Payment (Simulated)'
  },
  automation: {
    title: 'Automation',
    subtitle: 'Create rules and process files in batch.',
    tabs: {
      rules: 'My Rules',
      batch: 'Batch Process'
    },
    newRule: 'New Rule',
    emptyTitle: 'No rules defined',
    emptySubtitle: 'Create your first rule to automate repetitive tasks.',
    localTransformTitle: 'Local Transformation',
    localTransformDesc: 'Your data never leaves your browser. Processing uses your device power for maximum privacy and speed.',
    unifiedDownloadTitle: 'Unified Download',
    unifiedDownloadDesc: 'Get all processed files in a single organized ZIP, ready to share or archive.',
    batch: {
      massiveTitle: 'Mass Processing',
      massiveDesc: 'Upload up to 50 files simultaneously. The system will apply selected transformations to each independently.'
    },
    rule: {
      ifThis: 'If this happens:',
      onUpload: 'On file upload',
      condition: 'Condition',
      filenameContains: 'Filename contains',
      doThis: 'Do this:',
      autoClean: 'Smart Clean',
      convertTo: 'Convert to',
      onUploadOption: 'When uploading a file'
    },
    modal: {
      editTitle: 'Edit Rule',
      newTitle: 'New Automation',
      nameLabel: 'Rule Name',
      namePlaceholder: 'Eg: Process Sales Reports',
      triggerLabel: 'Trigger'
    }
  },
  terms: {
    headerTitle: 'Terms and Conditions of Use',
    section1Title: '1. Acceptance and Restrictions',
    section1Text: 'Welcome to DataFlow Pro. By using our software, you accept that this service is a SaaS data processing tool. It is strictly forbidden to use this platform to process illegally obtained databases, conduct fraud, or any illicit activity.',
    section2Title: '2. Intellectual Property and Resale Prohibition',
    section2Intro: 'The source code generated by DataFlow Pro (Python scripts, executables or SQL) is intellectual property of [YOUR COMPANY/NAME] and is licensed to the user solely for internal and personal use.',
    bullets: {
      resale: '⛔ RESALE is PROHIBITED, sublicensing or distributing the generated scripts as your own products.',
      watermark: '⛔ Removing watermarks, copyright comments or digital fingerprints from exported code is PROHIBITED.',
      competitor: '⛔ Using our engine to build a competing SaaS service is PROHIBITED.'
    },
    section3Title: '3. Limitation of Liability (The Shield)'
  },
  privacy: {
    headerTitle: 'Privacy Notice',
    section1Title: '1. Data We Collect',
    section1Intro: 'At DataFlow Pro (operated by [YOUR COMPANY/NAME]), we take your privacy very seriously. We only collect:',
    section1Item1: 'Registration information (email and encrypted password).',
    section1Item2: 'Files uploaded temporarily for processing.',
    section1Item3: 'Technical activity logs for system security.',
    section2Title: '2. Use of Your Files',
    section2Text: 'Your CSV/Excel files are processed privately. We DO NOT sell, share, or read the content of your data. Processing is automated and temporary files are periodically deleted from our servers.',
    section3Title: '3. ARCO Rights',
    section3Text: 'You have the right to access, rectify, cancel or oppose the processing of your data. To exercise these rights or request the complete deletion of your account, contact: [YOUR SUPPORT EMAIL].',
    footerNote: 'This notice complies with applicable data protection regulations.'
  },
  dashboard: {
    hero: {
      greeting: 'Hello, Analyst',
      freeHint: 'Upgrade to remove limits.',
      proHint: 'Full access.',
      proBadge: 'PRO',
      freeBadge: 'FREE'
    },
    limits: {
      filesLabel: 'FILES'
    },
    stats: {
      records: 'RECORDS',
      dataQuality: 'DATA QUALITY',
      emptyCells: 'empty',
      projects: 'PROJECTS',
      dimensions: 'DIMENSIONS',
      colsShort: 'Cols',
      lastFile: 'LAST FILE',
      none: 'None',
      transforms: 'TRANSFORMATIONS'
    },
    sections: {
      preparation: 'Preparation',
      workflow: 'Workflow'
    },
    prep: {
      guide: {
        title: 'Run Guide',
        desc: 'Local Python and scripts.',
        cta: 'View steps'
      },
      docs: {
        title: 'Documentation',
        desc: 'API and functions.',
        cta: 'Explore'
      }
    },
    actions: {
      uploadTitle: 'Upload',
      uploadDesc: 'Import data',
      transformTitle: 'Transform',
      transformDesc: 'Clean/Edit',
      exportTitle: 'Export',
      exportDesc: 'Download',
      wait: 'Wait...',
      open: 'Open'
    }
  }
}
