# Manual Completo de NoCodePY

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Guía de Usuario](#guía-de-usuario)
4. [Características Avanzadas](#características-avanzadas)
5. [Guía de Implementación y Despliegue](#guía-de-implementación-y-despliegue)
6. [Solución de Problemas](#solución-de-problemas)

---

## 1. Introducción
**NoCodePY** es una plataforma de transformación de datos "No-Code" diseñada para democratizar el análisis de datos. Permite a usuarios sin conocimientos de programación limpiar, transformar y exportar datos utilizando una interfaz visual intuitiva, similar a Power Query, pero con la potencia de generar código Python, SQL, R y M (Power Query) automáticamente.

### Características Clave
- **Transformación Visual**: Arrastrar y soltar, menús contextuales y sugerencias inteligentes.
- **Motor de Inferencia**: Detecta patrones (fechas, emails, separadores) y sugiere transformaciones.
- **Exportación Multi-Lenguaje**: Genera scripts listos para producción en Python (Pandas), SQL, R y Power Query.
- **Privacidad**: Procesamiento local en el navegador (para versiones ligeras) o híbrido seguro.

---

## 2. Arquitectura del Sistema
El sistema sigue una arquitectura de Aplicación de Página Única (SPA) moderna.

### Stack Tecnológico
- **Frontend**: React 19, Vite 7, Tailwind CSS 4.
- **Estado**: React Context API + Hooks personalizados (`useDataTransform`).
- **Persistencia**: Supabase (PostgreSQL) para almacenamiento de perfiles y logs de archivos.
- **Motor ETL**: Lógica de transformación en TypeScript/JavaScript ejecutada en el cliente.

### Flujo de Datos
1. **Ingesta**: El usuario carga CSV/Excel. Se parsea localmente (PapaParse/XLSX).
2. **Transformación**: Cada acción (filtro, reemplazo, cálculo) se registra en un array de `actions`.
3. **Estado**: El estado visual (`data`) se actualiza en tiempo real, pero el original se conserva para "replays".
4. **Exportación**: El array de `actions` se transpila a código destino (Python/SQL/M) mediante plantillas de cadena.

---

## 3. Guía de Usuario

### Inicio Rápido
1. **Cargar Datos**: Arrastre su archivo CSV o Excel al área de trabajo.
2. **Limpieza Automática**: Haga clic en la varita mágica "Smart Clean" para eliminar filas vacías y recortar espacios.
3. **Transformar**:
   - Haga clic derecho en una columna para ver opciones (Renombrar, Filtrar, Dividir).
   - Use el panel lateral para transformaciones complejas (Fórmulas, Regex).
4. **Columna Inteligente**:
   - Seleccione "Columna a partir de ejemplos".
   - Escriba el resultado deseado en 1 o 2 filas.
   - El sistema deducirá la regla (ej. extraer dominio de email).
5. **Exportar**: Vaya a la pestaña "Exportar" y elija su formato (CSV, SQL, Python, etc.).

### Casos de Uso Comunes
- **Normalización de Catálogos**: Estandarizar nombres de productos (Mayúsculas, Trim).
- **Limpieza de CRM**: Eliminar duplicados, validar emails y formatear teléfonos.
- **Preparación para BI**: Generar script SQL para insertar datos limpios en Data Warehouse.

---

## 4. Características Avanzadas

### Columna a partir de Ejemplos (AI-Powered)
El motor de inferencia soporta:
- **Matemáticas**: Detecta sumas, restas, multiplicaciones entre columnas.
- **Texto**: Concatenación, extracción de subcadenas, prefijos/sufijos.
- **Reordenamiento Inteligente**: Detecta si se están reorganizando partes de un texto (ej: "Doe, John" -> "John Doe").
- **Extracción Avanzada**:
  - **Regex**: Email, URL, Dominio, Moneda, Teléfono, Fechas.
  - **Entre Delimitadores**: Extrae texto entre paréntesis, corchetes, comillas, etc.
- **Fechas**: Detecta y reformatea automáticamente fechas (ISO, US, EU).
- **Split**: Detecta si el ejemplo es una parte de una cadena separada por guiones, comas, etc.

### Generación de Código (Transpilador)
- **Python**: Genera un script completo con interfaz gráfica (Tkinter) para que otros usuarios puedan ejecutar la limpieza.
- **SQL**: Genera `CREATE TABLE` e `INSERT INTO` optimizados.
- **Power Query (M)**: Genera código compatible con Excel y Power BI.
- **R**: Genera scripts utilizando `dplyr` y `readr`.

### Automatización de Flujos
- **Reglas**: Configure disparadores para procesar archivos automáticamente al subirlos.
- **Acciones Soportadas**:
  - **Limpieza Inteligente**: Elimina filas vacías y recorta espacios automáticamente.
  - **Conversión de Formato**: Sugiere exportación a SQL/JSON si el nombre del archivo coincide con un patrón.
- **Historial**: Visualice cuántas veces se ha ejecutado cada regla desde el panel de Automatización.

---

## 5. Guía de Implementación y Despliegue

### Requisitos
- Node.js 18+
- pnpm 9+
- Fuentes: Inter, Outfit, JetBrains Mono (Google Fonts)

### Instalación Local
```bash
git clone https://github.com/tu-org/nocodepy.git
cd nocodepy
pnpm install
pnpm run dev
# Para ejecutar pruebas:
pnpm test
```

### Despliegue en Producción
1. Construir el proyecto:
   ```bash
   pnpm run build
   ```
2. Los archivos en `dist/` pueden ser alojados en cualquier servidor estático (Vercel, Netlify, Nginx).
3. Configurar variables de entorno en `.env` para Supabase (si se usa persistencia):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

---

## 6. Solución de Problemas

### Error: "Archivo duplicado"
- El sistema ahora renombra automáticamente los archivos duplicados (ej. `archivo (1).csv`) para evitar conflictos.

### Error: "Modo Claro se ve extraño"
- Asegúrese de que su navegador no esté forzando un modo oscuro. La interfaz ha sido optimizada para alto contraste en ambos modos.

### Rendimiento lento con archivos grandes
- NoCodePY está optimizado para archivos de hasta 50MB en el navegador. Para archivos más grandes (GBs), utilice la función "Exportar Python" y ejecute el script localmente.
