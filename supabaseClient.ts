
import { createClient } from '@supabase/supabase-js';

// Intentamos leer de process.env, si no, usamos las credenciales directas (Safe for Anon Key)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://wgmxzvvzuqeqbanvgbgb.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbXh6dnZ6dXFlcWJhbnZnYmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTIyOTQsImV4cCI6MjA4MDI4ODI5NH0.UwlsiQPWs-ddFjfN3GPKiS2mjd5wPnSEZPYnUomf3B4";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
