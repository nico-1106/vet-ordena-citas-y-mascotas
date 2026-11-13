import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useSesion() {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { sesion, cargando };
}

export async function iniciarSesion(correo: string, clave: string) {
  if (!supabase) throw new Error("La base de datos no está configurada.");
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: clave,
  });
  if (error) throw error;
}

export async function cerrarSesion() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
