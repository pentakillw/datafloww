import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto personalizada
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Algo salió mal
            </h1>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              La aplicación ha encontrado un error inesperado. Hemos registrado este problema y nuestro equipo técnico lo revisará.
            </p>

            <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-500 break-all">
                    {this.state.error && this.state.error.toString()}
                </p>
            </div>

            <div className="flex gap-3 justify-center">
                <button 
                    onClick={() => this.setState({ hasError: false })}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Intentar de nuevo
                </button>
                <button 
                    onClick={this.handleReload}
                    className="px-5 py-2.5 rounded-xl bg-persian hover:bg-sea text-white font-bold shadow-lg shadow-persian/20 transition-all active:scale-95 flex items-center gap-2"
                >
                    <RefreshCw size={18} /> Recargar Página
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
