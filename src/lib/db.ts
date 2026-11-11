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
  nacimiento: string | null;
  dueno_nombre: string | null;
  dueno_telefono: string | null;
};

export type EstadoCita = "pendiente" | "atendida" | "cancelada"; // NUEVO

export type CitaDB = {
  id: number;
  created_at: string;
  mascota_id: string;
  fecha_hora: string;
  motivo: string | null;
  veterinario: string | null;
  estado: EstadoCita; // NUEVO
  mascotas: Pick<MascotaDB, "id" | "nombre" | "especie" | "raza" | "nacimiento" | "dueno_nombre"> | null;
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
  const errObj = e as { code?: string | number; message?: string } | null;
  const msg = e instanceof Error ? e.message : String(errObj?.message ?? e);
  const code = errObj?.code;
  if (String(code) === "23505" || /citas_vet_hora_uniq/i.test(msg))
    return "Ese veterinario ya tiene una cita a esa hora. Elige otra hora u otro veterinario.";
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
  "id, created_at, mascota_id, fecha_hora, motivo, veterinario, estado, mascotas(id, nombre, especie, raza, nacimiento, dueno_nombre)"; // CAMBIO: se agregó estado

function mapCitas(rows: unknown[]): CitaUI[] {
  return (rows as CitaDB[]).map((c) => ({ ...c, ...partes(c.fecha_hora) }));
}

// ---------- Consultas ----------

export function useMascotas(search?: string, especie?: string) {
  return useQuery({
    queryKey: ["mascotas", search, especie],
    queryFn: async () => {
      let query = cliente()
        .from("mascotas")
        .select("id, created_at, nombre, especie, raza, nacimiento, dueno_nombre, dueno_telefono")
        .order("nombre");

      if (search) {
        const cleaned = search.replace(/[,()%]/g, "").trim();
        if (cleaned) {
          query = query.or(`nombre.ilike.%${cleaned}%,dueno_nombre.ilike.%${cleaned}%`);
        }
      }

      if (especie && especie !== "Todas") {
        query = query.ilike("especie", `${especie}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MascotaDB[];
    },
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
}

export function useMascota(id: string) {
  return useQuery({
    queryKey: ["mascota", id],
    queryFn: async () => {
      const { data, error } = await cliente()
        .from("mascotas")
        .select("id, created_at, nombre, especie, raza, nacimiento, dueno_nombre, dueno_telefono")
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
        nacimiento: string | null;
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

      if (new Date(fecha_hora).getTime() < Date.now()) {
        throw new Error("No puedes agendar una cita en el pasado");
      }

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
      let mascotaCreadaId: string | null = null;
      if (input.nuevaMascota) {
        const { data, error } = await db
          .from("mascotas")
          .insert(input.nuevaMascota)
          .select("id")
          .single();
        if (error) throw error;
        mascotaId = (data as { id: string }).id;
        mascotaCreadaId = mascotaId;
      }
      if (!mascotaId) throw new Error("Selecciona una mascota.");

      const { error } = await db.from("citas").insert({
        mascota_id: mascotaId,
        fecha_hora,
        motivo: input.motivo,
        veterinario: input.veterinario,
      });
      if (error) {
        if (mascotaCreadaId) {
          await db.from("mascotas").delete().eq("id", mascotaCreadaId);
        }
        throw error;
      }
      return mascotaId;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["citas"] });
      qc.invalidateQueries({ queryKey: ["mascotas"] });
    },
  });
}

// ---------- Actualizaciones ---------- (NUEVO)

export function useActualizarEstadoCita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; estado: EstadoCita }) => {
      const { data, error } = await cliente()
        .from("citas")
        .update({ estado: input.estado })
        .eq("id", input.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("No se pudo actualizar la cita.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["citas"] });
    },
  });
}
// ---------- Tratamientos y vacunas ----------

export type TratamientoDB = {
  id: number;
  created_at: string;
  mascota_id: string;
  tipo: "vacuna" | "tratamiento";
  nombre: string;
  fecha: string;
  notas: string | null;
  proxima_fecha: string | null;
};

export function useTratamientosDeMascota(mascotaId: string) {
  return useQuery({
    queryKey: ["tratamientos", mascotaId],
    queryFn: async () => {
      const { data, error } = await cliente()
        .from("tratamientos")
        .select("id, created_at, mascota_id, tipo, nombre, fecha, notas, proxima_fecha")
        .eq("mascota_id", mascotaId)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TratamientoDB[];
    },
    retry: 1,
  });
}

export function useCrearTratamiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      mascota_id: string;
      tipo: "vacuna" | "tratamiento";
      nombre: string;
      fecha: string;
      notas: string | null;
      proxima_fecha: string | null;
    }) => {
      const { error } = await cliente().from("tratamientos").insert(input);
      if (error) throw error;
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({ queryKey: ["tratamientos", vars.mascota_id] });
    },
  });
}
