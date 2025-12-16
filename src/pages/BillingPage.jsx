import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Crown, ArrowLeft, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function BillingPage() {
    const navigate = useNavigate();
    const { redirectToBilling } = useData();

    // Esta página solo existe para simular el destino de la redirección de pago
    // En un entorno real, esta sería una página que carga widgets de Stripe.

    return (
        <div className="h-full flex items-center justify-center p-6 bg-gray-50/50 dark:bg-black/20">
            <div className="w-full max-w-2xl bg-white dark:bg-carbon rounded-xl shadow-2xl border border-gray-200 dark:border-wolf/10 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                
                <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-500 hover:text-persian flex items-center gap-2 text-sm font-medium">
                    <ArrowLeft size={16} /> Volver al Dashboard
                </button>

                <div className="p-4 bg-yellow-500/10 text-yellow-500 inline-block rounded-full mb-6">
                    <CreditCard size={48} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc flex items-center justify-center gap-3 mb-2">
                    <Crown className="text-yellow-500 fill-yellow-500" size={30} /> Pasarela de Pago PRO
                </h1>
                <p className="text-gray-500 dark:text-wolf text-lg mb-8">
                    Simulación de integración con Stripe para el plan PRO.
                </p>

                <div className="border border-persian/20 rounded-xl p-6 bg-persian/5 dark:bg-persian/10">
                    <p className="text-xl font-bold text-persian mb-2">Plan NoCodePY PRO</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-zinc mb-6">$9.99 <span className="text-base font-normal text-gray-500 dark:text-wolf">/ mes</span></p>
                    
                    <ul className="text-left space-y-2 text-gray-700 dark:text-wolf text-sm mb-8">
                        <li className="flex items-center gap-2"><Zap size={16} className="text-sea" /> Exportación de código Python ilimitada</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-sea" /> Límites de carga de datos extendidos</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-sea" /> Acceso a soporte prioritario</li>
                    </ul>

                    <button 
                        onClick={redirectToBilling}
                        className="w-full bg-persian hover:bg-sea text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-persian/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CreditCard size={20} /> Proceder al Pago (Simulado)
                    </button>
                </div>
            </div>
        </div>
    );
}