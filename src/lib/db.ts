import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_SIN_CONFIGURAR } from "@/lib/supabase";
import type { Especie } from "@/lib/store";

const TZ = "America/Bogota";
const OFFSET = "-05:00"; // Colombia no tiene horario de verano

export type MascotaDB = {
  id: string;
  created_at: string;
  nombre: string;
  especie: string | null;
  raza: string | null;
  dueno_nombre: string | null;
  dueno_telefono: string | null;
};

export type CitaDB = {
  id: number;
  created_at: string;
  mascota_id: string;
  fecha_hora: string;
  motivo: string | null;
  veterinario: string | null;
  mascotas: Pick<MascotaDB, "id" | "nombre" | "especie" | "raza" | "dueno_nombre"> | null;
};

export type CitaUI = CitaDB & { fecha: string; hora: string };

export function especieUI(e: string | null): Especie {
  return e?.toLowerCase().startsWith("gat") ? "Gato" : "Perro";
}

function cliente() {
  if (!supabase) throw new Error(SUPABASE_SIN_CONFIGURAR);
  return supabase;
}

export function mensajeError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  if (msg === SUPABASE_SIN_CONFIGURAR) return msg;
  if (/failed to fetch|network|load failed/i.test(msg))
    return "No pudimos conectarnos con la base de datos. Revisa tu conexión a internet e inténtalo de nuevo.";
  if (/row-level security|permission denied|42501/i.test(msg))
    return "La base de datos rechazó la operación por permisos. Revisa las políticas de seguridad de la tabla.";
  if (e instanceof Error) return msg;
  return `Ocurrió un error con la base de datos: ${msg}`;
}

/** Combina fecha (yyyy-mm-dd) y hora (HH:mm) en hora de Colombia. */
export function aFechaHora(fecha: string, hora: string) {
  return `${fecha}T${hora}:00${OFFSET}`;
}

function partes(iso: string) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const g = (t: string) => f.find((p) => p.type === t)!.value;
  return { fecha: `${g("year")}-${g("month")}-${g("day")}`, hora: `${g("hour")}:${g("minute")}` };
}

const SELECT_CITA =
  "id, created_at, mascota_id, fecha_hora, motivo, veterinario, mascotas(id, nombre, especie, raza, dueno_nombre)";

function mapCitas(rows: unknown[]): CitaUI[] {
  return (rows as CitaDB[]).map((c) => ({ ...c, ...partes(c.fecha_hora) }));
}

// ---------- Consultas ----------

export function useMascotas() {
  return useQuery({
    queryKey: ["mascotas"],
    queryFn: async () => {
      const { data, error } = await cliente()
        .from("mascotas")
        .select("id, created_at, nombre, especie, raza, dueno_nombre, dueno_telefono")
        .order("nombre");
      if (error) throw error;
      return (data ?? []) as MascotaDB[];
    },
    retry: 1,
  });
}

export function useMascota(id: string) {
  return useQuery({
    queryKey: ["mascota", id],
    queryFn: async () => {
      const { data, error } = await cliente()
        .from("mascotas")
        .select("id, created_at, nombre, especie, raza, dueno_nombre, dueno_telefono")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as MascotaDB | null;
    },
    retry: 1,
  });
}

/** Citas de un día (hora de Colombia). */
export function useCitasDelDia(fecha: string) {
  return useQuery({
    queryKey: ["citas", "dia", fecha],
    queryFn: async () => {
      const { data, error } = await cliente()
        .from("citas")
        .select(SELECT_CITA)
        .gte("fecha_hora", aFechaHora(fecha, "00:00"))
        .lte("fecha_hora", `${fecha}T23:59:59${OFFSET}`)
        .order("fecha_hora");
      if (error) throw error;
      return mapCitas(data ?? []);
    },
    retry: 1,
  });
}

export function useCitasDeMascota(mascotaId: string) {
  return useQuery({
    queryKey: ["citas", "mascota", mascotaId],
    queryFn: async () => {
      const { data, error } = await cliente()
        .from("citas")
        .select(SELECT_CITA)
        .eq("mascota_id", mascotaId)
        .order("fecha_hora", { ascending: false });
      if (error) throw error;
      return mapCitas(data ?? []);
    },
    retry: 1,
  });
}

// ---------- Inserciones ----------

export function useCrearCita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nuevaMascota?: {
        nombre: string;
        especie: string;
        raza: string | null;
        dueno_nombre: string;
        dueno_telefono: string | null;
      };
      mascotaId?: string;
      veterinario: string;
      fecha: string;
      hora: string;
      motivo: string;
    }) => {
      const db = cliente();
      const fecha_hora = aFechaHora(input.fecha, input.hora);

      // Revalidar en la base de datos que el veterinario siga libre a esa hora.
      const { data: choque, error: errChoque } = await db
        .from("citas")
        .select("id")
        .eq("veterinario", input.veterinario)
        .eq("fecha_hora", fecha_hora)
        .limit(1);
      if (errChoque) throw errChoque;
      if (choque && choque.length > 0)
        throw new Error(
          `${input.veterinario} ya tiene una cita a esa hora. Elige otra hora u otro veterinario.`,
        );

      let mascotaId = input.mascotaId;
      if (input.nuevaMascota) {
        const { data, error } = await db
          .from("mascotas")
          .insert(input.nuevaMascota)
          .select("id")
          .single();
        if (error) throw error;
        mascotaId = (data as { id: string }).id;
      }
      if (!mascotaId) throw new Error("Selecciona una mascota.");

      const { error } = await db.from("citas").insert({
        mascota_id: mascotaId,
        fecha_hora,
        motivo: input.motivo,
        veterinario: input.veterinario,
      });
      if (error) throw error;
      return mascotaId;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["citas"] });
      qc.invalidateQueries({ queryKey: ["mascotas"] });
    },
  });
}
