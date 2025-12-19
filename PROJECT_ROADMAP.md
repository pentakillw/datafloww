# Análisis y Hoja de Ruta del Proyecto Data Flow Pro

## 1. Evaluación de Arquitectura y Estado Actual

El sistema **Data Flow Pro** es una aplicación de transformación de datos (ETL-lite) basada en navegador (Client-side), construida con React, Vite y Tailwind CSS. Utiliza Supabase para autenticación y persistencia básica.

### Fortalezas
*   **Privacidad y Velocidad:** El procesamiento local (Client-side) garantiza que los datos sensibles no abandonen el dispositivo del usuario en operaciones básicas.
*   **UX Moderna:** Interfaz reactiva, modo oscuro, y diseño responsive bien implementado.
*   **Flexibilidad:** El motor de transformación (`transformEngine.js`) es modular y permite operaciones complejas (limpieza, regex, fórmulas).
*   **Automatización:** Reciente implementación de procesamiento por lotes y reglas personalizadas.

### Debilidades y Carencias Críticas
*   **Persistencia de Datos:** El sistema depende excesivamente del estado local (`localStorage` o memoria). No hay un almacenamiento robusto en la nube para datasets grandes o historial de versiones persistente entre dispositivos.
*   **Escalabilidad:** El procesamiento en el navegador (`BatchProcessor`) bloqueará la UI con archivos muy grandes (>50MB). Falta implementación de Web Workers o procesamiento Server-side (Edge Functions).
*   **Colaboración:** No existen conceptos de "Equipos" o permisos compartidos. Los proyectos son personales.
*   **Integraciones:** La sección de "Export Hub" es estática. Faltan conectores reales (Google Sheets, Notion, Webhooks) y una API pública real.

---

## 2. Áreas de Mejora y Propuestas

### A. Gestión de Usuarios y Permisos (Seguridad)
*   **Propuesta:** Implementar "Espacios de Trabajo" (Workspaces) compartidos.
*   **Justificación:** Permite el uso corporativo donde equipos de datos colaboran en las mismas reglas de limpieza.
*   **Requisitos:** Nuevas tablas en Supabase (`workspaces`, `workspace_members`), actualización de RLS (Row Level Security).
*   **Estimación:** Media (2 semanas).

### B. Procesamiento de Datos (Core)
*   **Propuesta:** Implementación de Web Workers para el `BatchProcessor`.
*   **Justificación:** Evitar que la interfaz se congele durante la carga/transformación de archivos grandes.
*   **Requisitos:** Refactorizar `transformEngine.js` para correr en un contexto de Worker.
*   **Estimación:** Baja (3 días).

### C. Integraciones (Conectividad)
*   **Propuesta:** Conectores "No-Code" reales.
*   **Justificación:** Los usuarios quieren "leer de Google Sheets -> transformar -> escribir en Base de Datos".
*   **Detalle:**
    *   *Input:* URL de Google Sheets (CSV publish).
    *   *Output:* Webhook POST (enviar JSON procesado a Zapier/Make).
*   **Estimación:** Alta (3 semanas).

### D. Reportes y Visualización
*   **Propuesta:** Dashboard de Análisis Dinámico.
*   **Justificación:** El `AnalysisDashboard` actual es básico. Se requiere un constructor de gráficos (Drag & Drop) sobre los datos transformados.
*   **Estimación:** Media (2 semanas).

---

## 3. Priorización de Funcionalidades

| Prioridad | Funcionalidad | Impacto | Complejidad | Razón |
| :--- | :--- | :--- | :--- | :--- |
| **1 (Alta)** | **Web Workers** | Alto (Performance) | Baja | Mejora inmediata de UX en cargas pesadas. |
| **2 (Alta)** | **Conectores (Webhooks)** | Alto (Valor) | Media | Permite integrar la herramienta en flujos reales de empresa. |
| **3 (Media)** | **Persistencia Cloud** | Medio | Alta | Necesario para sincronización, pero el modo local funciona bien por ahora. |
| **4 (Baja)** | **Teams/Colaboración** | Bajo (MVP) | Alta | Feature "Enterprise" para una fase posterior. |

---

## 4. Plan de Implementación (Fases)

### Fase 1: Optimización y Estabilidad (Semana 1)
*   [ ] Migrar `transformEngine` a Web Worker.
*   [ ] Tests unitarios exhaustivos para el motor de transformación.
*   [ ] Refactorización de `ExportHub` para preparar la arquitectura de conectores.

### Fase 2: Conectividad (Semana 2-3)
*   [ ] Implementar salida vía **Webhook** (POST JSON).
*   [ ] Implementar entrada vía URL (CSV/JSON remoto).
*   [ ] Crear UI de configuración de "Conectores" en Export Hub.

### Fase 3: Nube y Colaboración (Mes 2)
*   [ ] Base de datos de Proyectos en Supabase.
*   [ ] Almacenamiento de Datasets en Buckets (S3/Supabase Storage).
*   [ ] Roles y Permisos.

---

## 5. Recomendaciones Técnicas

1.  **Código Modular:** Mantener la lógica de negocio (`transformEngine`) desacoplada de la UI (React Components) para facilitar la migración a Workers o Backend (Node.js) en el futuro.
2.  **Testing:** Implementar Vitest para asegurar que las reglas de transformación (ej: regex, fórmulas matemáticas) no se rompan con actualizaciones.
3.  **Seguridad:** Asegurar que las API Keys de servicios terceros (si se añaden) se guarden encriptadas o se manejen vía Proxy/Edge Functions, nunca en el cliente plano.
