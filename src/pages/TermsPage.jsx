import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Lock, Scale } from 'lucide-react';
import { useI18n } from '../i18n/i18n.jsx';

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#161b22] shadow-xl rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-100 dark:bg-white/5 p-6 border-b border-gray-200 dark:border-white/5 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="text-teal-500" /> {t('terms.headerTitle')}
          </h1>
        </div>

        {/* Contenido Legal */}
        <div className="p-8 space-y-8 text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-300">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('terms.section1Title')}</h2>
            <p>
              {t('terms.section1Text')}
            </p>
          </section>

          <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/20">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
              <Lock size={18} /> {t('terms.section2Title')}
            </h2>
            <p className="mb-4">
              {t('terms.section2Intro')}
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>{t('terms.bullets.resale')}</li>
              <li>{t('terms.bullets.watermark')}</li>
              <li>{t('terms.bullets.competitor')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('terms.section3Title')}</h2>
            <p>
              DataFlow Pro se proporciona "TAL CUAL". <strong>No nos hacemos responsables</strong> por pérdida de datos, errores en los cálculos, decisiones de negocio tomadas en base a los datos procesados, o daños directos o indirectos derivados del uso del software. Es responsabilidad del usuario verificar la integridad de sus datos antes de utilizarlos en entornos de producción.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">4. Suspensión de Cuenta</h2>
            <p>
              Nos reservamos el derecho de suspender inmediatamente cualquier cuenta que detectemos realizando ingeniería inversa, compartiendo credenciales o intentando vulnerar la seguridad del sistema.
            </p>
          </section>

          <div className="border-t border-gray-200 dark:border-white/10 pt-6 mt-8 text-xs text-gray-400 text-center">
            Última actualización: {new Date().toLocaleDateString()} — Documento Legal Oficial de DataFlow Pro
          </div>
        </div>
      </div>
    </div>
  );
}
