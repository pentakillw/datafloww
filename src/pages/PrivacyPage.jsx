import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#161b22] shadow-xl rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        
        <div className="bg-gray-100 dark:bg-white/5 p-6 border-b border-gray-200 dark:border-white/5 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-teal-500" /> Aviso de Privacidad
          </h1>
        </div>

        <div className="p-8 space-y-8 text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-300">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Datos que Recabamos</h2>
            <p>
              En <strong>DataFlow Pro</strong> (operado por [TU EMPRESA/NOMBRE]), nos tomamos muy en serio tu privacidad. Solo recolectamos:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Información de registro (correo electrónico y contraseña encriptada).</li>
              <li>Archivos cargados temporalmente para su procesamiento.</li>
              <li>Logs de actividad técnica para seguridad del sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. Uso de tus Archivos</h2>
            <div className="bg-teal-50 dark:bg-teal-900/10 p-4 rounded-lg border border-teal-100 dark:border-teal-900/20 flex gap-3">
              <FileText className="text-teal-600 shrink-0" />
              <p>
                Tus archivos CSV/Excel son procesados de forma privada. <strong>NO vendemos, compartimos ni leemos</strong> el contenido de tus datos. El procesamiento es automatizado y los archivos temporales se eliminan periódicamente de nuestros servidores.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Derechos ARCO</h2>
            <p>
              Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos. Para ejercer estos derechos o solicitar la eliminación completa de tu cuenta, contacta a: <strong>[TU CORREO DE SOPORTE]</strong>.
            </p>
          </section>

          <div className="border-t border-gray-200 dark:border-white/10 pt-6 mt-8 text-xs text-gray-400 text-center">
            Este aviso cumple con las normativas de protección de datos vigentes.
          </div>
        </div>
      </div>
    </div>
  );
}