import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { DataProvider } from './context/DataContext';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataWorkspace from './pages/DataWorkspace';
import TransformationStudio from './pages/TransformationStudio';
import AnalysisDashboard from './pages/AnalysisDashboard';
import ExportHub from './pages/ExportHub';
import AutomationHub from './pages/AutomationHub';
import ProjectsHub from './pages/ProjectsHub';
import DocsPage from './pages/DocsPage';
import InstallGuide from './pages/InstallGuide';

// --- NUEVAS PÁGINAS LEGALES Y FACTURACIÓN ---
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import BillingPage from './pages/BillingPage'; // <--- AGREGAR ESTA LÍNEA

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-teal-500 font-mono">Cargando sistema...</div>;
  }

  return (
    <DataProvider>
      <Routes>
        {/* Ruta pública: Landing Page */}
        <Route path="/landing" element={!session ? <LandingPage /> : <Navigate to="/" />} />
        
        {/* Rutas Legales (Públicas) */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Login */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        
        {/* Rutas protegidas (Requieren Login) */}
        <Route element={session ? <Layout /> : <Navigate to="/landing" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataWorkspace />} />
          <Route path="/transform" element={<TransformationStudio />} />
          <Route path="/analysis" element={<AnalysisDashboard />} />
          <Route path="/automation" element={<AutomationHub />} />
          <Route path="/projects" element={<ProjectsHub />} />
          <Route path="/export" element={<ExportHub />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/guide" element={<InstallGuide />} />
          <Route path="/billing" element={<BillingPage />} /> {/* <--- AGREGAR RUTA DE FACTURACIÓN */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={session ? "/" : "/landing"} />} />
      </Routes>
    </DataProvider>
  );
}