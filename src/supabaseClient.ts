
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Credenciales de Supabase faltantes. La aplicación cargará pero la autenticación fallará.');
  console.warn('Asegúrate de crear un archivo .env en la raíz con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

// Usamos valores placeholder para evitar que la app explote con "Invalid URL" si faltan las variables
// Esto permite que la UI renderice y muestre errores controlados en lugar de una pantalla blanca
const validUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const validKey = SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(validUrl, validKey);
