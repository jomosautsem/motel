
import { createClient } from '@supabase/supabase-js';

// Usamos las credenciales directas para evitar errores de "process is not defined" en el navegador
const supabaseUrl = "https://wgmxzvvzuqeqbanvgbgb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbXh6dnZ6dXFlcWJhbnZnYmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTIyOTQsImV4cCI6MjA4MDI4ODI5NH0.UwlsiQPWs-ddFjfN3GPKiS2mjd5wPnSEZPYnUomf3B4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
