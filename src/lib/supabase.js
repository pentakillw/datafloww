import { createClient } from '@supabase/supabase-js'

// Estas variables se toman del archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRÍTICO: Faltan las variables de entorno de Supabase.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)