
import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANTE: Reemplaza estos valores con los de tu proyecto de Supabase
// Puedes encontrarlos en Settings -> API
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
