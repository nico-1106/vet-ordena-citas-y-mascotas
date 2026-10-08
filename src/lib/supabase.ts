import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabasePublishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as
  | string
  | undefined;

// Solo se usa la clave publicable (pública por diseño). Nunca poner aquí la service_role.
// Si faltan las variables no rompemos toda la app: cada pantalla muestra un aviso claro.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabasePublishableKey ? createClient(supabaseUrl, supabasePublishableKey) : null;

export const SUPABASE_SIN_CONFIGURAR =
  "La conexión con la base de datos no está configurada (faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY).";
