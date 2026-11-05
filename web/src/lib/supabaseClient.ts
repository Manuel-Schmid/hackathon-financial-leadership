import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** null, wenn keine Supabase-Werte in .env stehen oder der Datenmodus "json" ist. */
export const supabase: SupabaseClient | null =
  url && key && import.meta.env.VITE_DATA_MODE !== 'json' ? createClient(url, key) : null;
