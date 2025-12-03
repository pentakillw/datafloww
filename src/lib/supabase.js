import { createClient } from '@supabase/supabase-js'

// Variables de entorno desde .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Faltan las credenciales de Supabase. Revisa tu archivo .env.local')
}

// Cliente exportado para usar en toda la app
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
)