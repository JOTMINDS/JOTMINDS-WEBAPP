import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fc8eb847.supabase.co'; // Using a placeholder since I can't read the .env right now easily
// Actually, I can use deno to read .env
